import { Database } from 'bun:sqlite'

interface TachyonRow {
  id: number
  tachyon: string
  css: string
  tailwind: string | null
  used: boolean
}

/**
 * Represents a database for storing Tachyon and Tailwind CSS classes.
 */
class TachyonTailwindDatabase {
  private db: Database
  private tachyonSet: Set<string> | null = null
  private mappingMap: Map<string, string> | null = null

  constructor() {
    this.db = new Database('tt.sqlite')
    this.init()
  }

  /**
   * Retrieves all Tachyon rows from the database.
   * @returns An array of TachyonRow objects.
   */
  getAllTachyons(): TachyonRow[] {
    return this.db
      .query(/*sql*/ `SELECT * FROM tachyons;`)
      .all() as TachyonRow[]
  }

  /**
   * Retrieves all Tachyon classes that have been used in the project.
   * @returns {TachyonRow[]} An array of TachyonRow objects representing the used Tachyon classes.
   */
  getAllUsedTachyonClasses() {
    return this.db
      .query(/*sql*/ `SELECT * FROM tachyons WHERE used = TRUE;`)
      .all() as TachyonRow[]
  }

  /**
   * Returns an array of all Tachyon classes that have been mapped to Tailwind classes.
   * @returns {TachyonRow[]} An array of TachyonRow objects representing the mapped Tachyon classes.
   */
  getAllMappedTachyonClasses(): TachyonRow[] {
    return this.db
      .query(/*sql*/ `SELECT * FROM tachyons WHERE tailwind IS NOT NULL;`)
      .all() as TachyonRow[]
  }

  /**
   * Retrieves the ID of a file from the database based on its path.
   * @param file - The path of the file to retrieve.
   * @returns The ID of the file, or null if the file is not found.
   */
  getFile(file: string) {
    const row = this.db
      .query(/* sql */ `SELECT id FROM files WHERE path = :path;`)
      .get(file) as { id: number } | null
    return row ? row.id : null
  }

  /**
   * Returns an array of file paths that contain Tachyon classes.
   * @returns {string[]} An array of file paths.
   */
  getFilesContainingTachyonClasses(): string[] {
    const rows = this.db
      .query(
        /* sql */ `SELECT DISTINCT path FROM files
                    JOIN tachyons_files ON files.id = tachyons_files.file_id;`,
      )
      .all() as { path: string }[]
    return rows.map((row) => row.path)
  }

  /**
   * Creates a new file record in the database if it does not already exist, or updates an existing record if it does.
   * Associates the given Tachyon ID with the file.
   *
   * @param file - The path of the file to create or update.
   * @param tachyonID - The ID of the Tachyon to associate with the file.
   */
  createOrUpdateFile(file: string, tachyonID: number) {
    let fileID = this.getFile(file)

    // insert row if it does not exist
    if (fileID == null) {
      this.db
        .prepare(/* sql */ `INSERT OR IGNORE INTO files (path) VALUES ($file);`)
        .run(file)

      // get latest insert row id of the file if it was inserted or null otherwise
      const result = this.db
        .prepare('SELECT last_insert_rowid() AS id;')
        .get() as { id: number } | null

      fileID = result?.id ?? null
    }

    // connect tachyon and file
    this.db
      .prepare(
        /* sql */ `INSERT OR IGNORE INTO tachyons_files (tachyon_id, file_id) VALUES (?, ?);`,
      )
      .run(tachyonID, fileID)
  }

  /**
   * Creates or updates a Tachyon class in the database.
   * @param tachyonClassName - The name of the Tachyon class.
   * @param css - The CSS code for the Tachyon class.
   * @param tailwind? - The Tailwind CSS equivalent for the Tachyon class, if available.
   * @returns The ID of the created or updated Tachyon class.
   */
  createOrUpdateTachyon(
    tachyonClassName: string,
    css: string,
    tailwind?: string | null,
  ) {
    // check if tachyon class already exists
    const row = this.getTachyonByTachyonClass(tachyonClassName)

    // update tachyon class if it exists and return the id
    if (row) {
      this.db
        .prepare(
          /* sql */ `UPDATE tachyons SET css = ?, tailwind = ? WHERE id = ?;`,
        )
        .run(css, tailwind === undefined ? row.tailwind : tailwind, row.id)
      return row.id
    }

    // create tachyon class if it does not exist
    this.db
      .prepare(
        /* sql */ `INSERT INTO tachyons (tachyon, css, tailwind) VALUES (?, ?, ?)`,
      )
      .run(tachyonClassName, css, tailwind ?? null)

    // get latest insert row id of the tachyon class
    const { id } = this.db
      .prepare('SELECT last_insert_rowid() AS id;')
      .get() as { id: number }

    return id
  }

  /**
   * Marks a Tachyon class as used in the database.
   * @param tachyonClassName - The name of the Tachyon class to mark as used.
   * @returns The ID of the Tachyon class that was marked as used.
   * @throws An error if the Tachyon class is not found in the database.
   */
  markTachyonClassAsUsed(tachyonClassName: string) {
    const tachyonID = this.getTachyonIDFromTachyonClassName(tachyonClassName)
    if (!tachyonID) throw new Error('Tachyon class not found')

    this.db
      .prepare(/* sql */ `UPDATE tachyons SET used = TRUE WHERE id = ?;`)
      .run(tachyonID)

    return tachyonID
  }

  /**
   * Retrieves the ID of a Tachyon class from the database.
   * @param tachyonClassName The name of the Tachyon class to retrieve the ID for.
   * @returns The ID of the Tachyon class, or null if it does not exist in the database.
   */
  getTachyonIDFromTachyonClassName(tachyonClassName: string) {
    const row = this.db
      .prepare(/* sql */ `SELECT id FROM tachyons WHERE tachyon = ?;`)
      .get(tachyonClassName) as { id: number } | null
    return row ? row.id : null
  }

  /**
   * Retrieves a TachyonRow from the database by its Tachyon class name.
   * @param tachyonClassName The name of the Tachyon class to retrieve.
   * @returns The TachyonRow object if found, otherwise null.
   */
  getTachyonByTachyonClass(tachyonClassName: string) {
    return this.db
      .prepare(/* sql */ `SELECT * FROM tachyons WHERE tachyon = ?;`)
      .get(tachyonClassName) as TachyonRow | null
  }

  /**
   * Resets the database by dropping all tables and initializing them again.
   */
  reset() {
    this.db.run(/*sql*/ `DROP TABLE IF EXISTS tachyons;`)
    this.db.run(/*sql*/ `DROP TABLE IF EXISTS files;`)
    this.db.run(/*sql*/ `DROP TABLE IF EXISTS tachyons_files;`)
    this.init()
  }

  /**
   * Initializes the database by creating the necessary tables if they don't exist.
   */
  init() {
    // Create tachyons table
    this.db.run(/* sql */ `
      CREATE TABLE IF NOT EXISTS tachyons (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          tachyon TEXT NOT NULL,
          css TEXT NOT NULL,
          tailwind TEXT,
          used BOOLEAN NOT NULL DEFAULT FALSE
      );
    `)

    // Create files table
    this.db.run(/* sql */ `
      CREATE TABLE IF NOT EXISTS files (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          path TEXT NOT NULL
      );
    `)

    // Create tachyons_files
    this.db.run(/* sql */ `
      CREATE TABLE IF NOT EXISTS tachyons_files (
        tachyon_id INTEGER,
        file_id INTEGER,
        PRIMARY KEY (tachyon_id, file_id),
        FOREIGN KEY (tachyon_id) REFERENCES tachyons(id),
        FOREIGN KEY (file_id) REFERENCES files(id)
      );
    `)
  }

  /**
   * Closes the database connection.
   */
  close() {
    this.db.close()
  }

  /**
   * Returns a Set of all Tachyon classes.
   * If the Set has not been initialized yet, it will be initialized and cached for future use.
   * @returns {Set<string>} A Set of all Tachyon classes.
   */
  getTachyonClassesAsSet() {
    if (!this.tachyonSet) {
      const tachyonSet = new Set<string>()
      this.getAllTachyons().forEach((tachyon) => {
        tachyonSet.add(tachyon.tachyon)
      })
      this.tachyonSet = tachyonSet
    }
    return this.tachyonSet
  }

  /**
   * Returns a Map object containing all mapped Tachyon classes.
   * If the mappingMap property is not set, it will be initialized with the mapping data.
   * @returns {Map<string, string>} A Map object containing all mapped Tachyon classes.
   */
  getAllMappedTachyonClassesAsMap() {
    if (!this.mappingMap) {
      const map = new Map<string, string>()
      this.getAllMappedTachyonClasses().forEach((tachyon) => {
        map.set(tachyon.tachyon, tachyon.tailwind as string)
      })
      this.mappingMap = map
    }
    return this.mappingMap
  }

  /**
   * Returns an array of Tachyon classes that are not mapped to any Tailwind classes.
   * @returns An array of Tachyon classes that are not mapped to any Tailwind classes.
   */
  getNotMappedTailwindClasses() {
    return this.getAllUsedTachyonClasses().filter(
      (tachyon) => tachyon.tailwind === null,
    )
  }
}

// Create a singleton instance of the database
const db = new TachyonTailwindDatabase()
export default db
