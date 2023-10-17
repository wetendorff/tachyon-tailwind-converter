import { Database } from 'bun:sqlite'

interface Tachyon {
  id: number
  tachyon: string
  css: string
  tailwind: string | null | undefined
  count: number
  used: boolean
}

class TachyonTailwindDatabase {
  private db: Database
  private tachyonSet: Set<string> | null = null

  constructor() {
    this.db = new Database('tt.sqlite')
    this.init()
  }

  // Get All Tachyon
  getAllTachyon(): Tachyon[] {
    return this.db
      .query(
        `
            SELECT * FROM tachyons;
        `,
      )
      .all() as Tachyon[]
  }

  // Get all used Tachyon Classes
  getAllUsedTachyonClasses() {
    return this.db
      .query(
        `
            SELECT * FROM tachyons WHERE used = TRUE;
        `,
      )
      .all()
  }

  // Get all unused Tachyon Classes
  getAllUnusedTachyonClasses() {
    return this.db
      .query(
        `
            SELECT * FROM tachyons WHERE used = FALSE;
        `,
      )
      .all()
  }

  // Get all Mapped Tachyon Classes
  getAllMappedTachyonClasses(): Tachyon[] {
    return this.db
      .query(
        `
            SELECT * FROM tachyons WHERE tailwind IS NOT NULL;
        `,
      )
      .all() as Tachyon[]
  }

  // Get file
  getFile(file: string) {
    const row = this.db
      .query(/* sql */ `SELECT id FROM files WHERE path = :path;`)
      .get(file) as { id: number } | null
    return row ? row.id : null
  }

  // Create or Update File
  createOrUpdateFile(file: string, tachyonId: number) {
    let fileId = this.getFile(file)

    // insert row if it does not exist
    if (fileId == null) {
      this.db
        .prepare(/* sql */ `INSERT OR IGNORE INTO files (path) VALUES ($file);`)
        .run(file)

      // get latest insert row id of the file if it was inserted or null otherwise
      const result = this.db
        .prepare('SELECT last_insert_rowid() AS id;')
        .get() as { id: number } | null

      fileId = result?.id ?? null
    }

    // Connect tachyon and file
    this.db
      .prepare(
        /* sql */ `INSERT OR IGNORE INTO tachyons_files (tachyon_id, file_id) VALUES (?, ?);`,
      )
      .run(tachyonId, fileId)
  }

  // Create or Update Tachyon Class name
  createOrUpdateTachyon(tachyonClassName: string, css: string) {
    const row = this.db
      .prepare(/* sql */ `SELECT id, count FROM tachyons WHERE tachyon = ?`)
      .get(tachyonClassName) as { id: number; count: number } | null
    const id = row?.id ?? null
    const count = row ? row.count + 1 : 1

    // upsert row
    this.db
      .prepare(
        /* sql */ `INSERT INTO tachyons (id, tachyon, css, count) VALUES (?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET tachyon = excluded.tachyon, css = excluded.css, count = excluded.count;`,
      )
      .run(id, tachyonClassName, css, count)
    const { id: tachyonId } = this.db
      .prepare('SELECT last_insert_rowid() AS id;')
      .get() as { id: number }
  }

  // Get Tachyon Classes used by file
  getTachyonClassesUsedByFile(file: string) {
    const fileId = this.getFile(file)
    return this.db
      .prepare(
        /* sql */ `SELECT tachyon FROM tachyons_files
                    JOIN tachyons ON tachyon_id = tachyons.id
                    WHERE file_id = ?;`,
      )
      .all(fileId)
  }

  // Mark Tachyon Class as used
  markTachyonClassAsUsed(tachyonClassName: string) {
    const tachyonId = this.getTachyonId(tachyonClassName)
    if (!tachyonId) throw new Error('Tachyon class not found')

    this.db
      .prepare(/* sql */ `UPDATE tachyons SET used = TRUE WHERE id = ?;`)
      .run(tachyonId)

    return tachyonId
  }

  // Get Tachyon Id
  getTachyonId(tachyonClassName: string) {
    const row = this.db
      .prepare(/* sql */ `SELECT id FROM tachyons WHERE tachyon = ?;`)
      .get(tachyonClassName) as { id: number } | null
    return row ? row.id : null
  }

  // Reset Database
  reset() {
    this.db.run(/*sql*/ `DROP TABLE IF EXISTS tachyons;`)
    this.db.run(/*sql*/ `DROP TABLE IF EXISTS files;`)
    this.db.run(/*sql*/ `DROP TABLE IF EXISTS tachyons_files;`)
    this.init()
  }

  // Initialize the database
  init() {
    // Create tachyons table
    this.db.run(/* sql */ `
      CREATE TABLE IF NOT EXISTS tachyons (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          tachyon TEXT NOT NULL,
          css TEXT NOT NULL,
          tailwind TEXT,
          count INTEGER NOT NULL DEFAULT 0,
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

  // Close the database
  close() {
    this.db.close()
  }

  // Get Tachyon Class
  getTachyonClassesAsSet() {
    if (!this.tachyonSet) {
      const tachyonSet = new Set<string>()
      this.getAllTachyon().forEach((tachyon) => {
        tachyonSet.add(tachyon.tachyon)
      })
      this.tachyonSet = tachyonSet
    }
    return this.tachyonSet
  }
}

const db = new TachyonTailwindDatabase()
export default db
