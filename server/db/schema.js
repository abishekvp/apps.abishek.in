/**
 * Schema & Initial Migration for apps.abishek.in
 */
import crypto from 'node:crypto';

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derived.toString('hex')}`;
}

export function verifyPassword(password, hash) {
  const [salt, key] = (hash || '').split(':');
  if (!salt || !key) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), derived);
}

export async function runMigrations(database) {
  // 1. Create Tables
  await database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      notify_new_tools INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      icon TEXT NOT NULL,
      category TEXT NOT NULL,
      badge TEXT DEFAULT 'Active',
      short_desc TEXT NOT NULL,
      long_desc TEXT,
      features TEXT,
      tags TEXT,
      is_hidden INTEGER DEFAULT 0,
      is_upcoming INTEGER DEFAULT 0,
      launch_date TEXT,
      likes_count INTEGER DEFAULT 0,
      display_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tool_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      email TEXT NOT NULL,
      name TEXT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      use_cases TEXT,
      ref_links TEXT,
      votes_count INTEGER DEFAULT 1,
      status TEXT DEFAULT 'pending',
      admin_notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bug_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      email TEXT NOT NULL,
      tool_slug TEXT NOT NULL,
      tool_name TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      steps_to_reproduce TEXT,
      severity TEXT DEFAULT 'medium',
      system_info TEXT,
      status TEXT DEFAULT 'open',
      admin_notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS launch_subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      tool_slug TEXT DEFAULT 'all',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Seed Default Admin
  const adminUser = await database.one("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
  if (!adminUser) {
    const defaultAdminEmail = process.env.ADMIN_EMAIL || 'admin@abishek.in';
    const defaultAdminPassword = process.env.ADMIN_PASSWORD || 'admin';
    const passHash = hashPassword(defaultAdminPassword);

    await database.run(
      "INSERT INTO users (email, password_hash, name, role, notify_new_tools) VALUES (?, ?, ?, 'admin', 1)",
      [defaultAdminEmail, passHash, 'Platform Admin']
    );
    console.log(`[SEED] Default Admin created: ${defaultAdminEmail} (Password: ${defaultAdminPassword})`);
  }

  // 3. Seed Default Tools
  const toolCount = await database.one("SELECT COUNT(*) as cnt FROM tools");
  const count = Number(toolCount?.cnt || 0);

  if (count === 0) {
    console.log('[SEED] Seeding ecosystem tools...');

    const defaultTools = [
      {
        slug: 'base64',
        name: 'Base64 Studio Pro',
        url: 'https://base64.abishek.in',
        icon: '⚡',
        category: 'formatters',
        badge: 'Live',
        short_desc: 'Professional Base64 encoding, decoding, file Data URI generation, Hex conversion, and checksum verification.',
        long_desc: 'A comprehensive fullscreen suite for encoding & decoding UTF-8/Latin-1 strings, converting files, audio, images and PDFs to Data URIs, reverse magic-byte sniffing to files, and real-time cryptographic checksums.',
        features: JSON.stringify(['Text UTF-8 & URL-safe RFC 4648', 'File & image to Base64', 'Auto-detect file types & download', 'Hexadecimal byte conversion', 'Data URI parser', 'MD5 & SHA-256 validation']),
        tags: JSON.stringify(['base64', 'decoder', 'encoder', 'data-uri', 'hex', 'checksum']),
        is_hidden: 0,
        is_upcoming: 0,
        likes_count: 124,
        display_order: 1
      },
      {
        slug: 'compiler',
        name: 'Web Compiler Studio',
        url: 'https://compiler.abishek.in',
        icon: '💻',
        category: 'developer',
        badge: 'Live',
        short_desc: 'Live HTML, CSS, and JavaScript compiler & interactive sandboxed playground with dev console.',
        long_desc: 'Fullscreen multi-pane code playground supporting live preview, integrated console error capture, 1-click CDN library injector (Tailwind, Bootstrap, React, Three.js), device simulation, and code bundle exporting.',
        features: JSON.stringify(['Multi-pane code editor', 'Instant sandboxed execution', 'DevTools console output', 'Tailwind & Three.js CDNs', 'Device screen simulator', 'Single-file HTML export']),
        tags: JSON.stringify(['compiler', 'playground', 'html', 'css', 'javascript', 'ide']),
        is_hidden: 0,
        is_upcoming: 0,
        likes_count: 189,
        display_order: 2
      },
      {
        slug: 'json',
        name: 'JSON Master Suite',
        url: 'https://json.abishek.in',
        icon: '🌲',
        category: 'formatters',
        badge: 'Live',
        short_desc: 'Advanced JSON formatter, syntax auto-repair, interactive tree inspector, JSONPath query, and multi-format converter.',
        long_desc: 'Format, minify, and automatically repair broken JSON with unquoted keys or trailing commas. Includes searchable tree viewer, TypeScript/CSV/YAML/XML/Go/Python converters, and side-by-side JSON diffing.',
        features: JSON.stringify(['Auto-repair malformed JSON', 'Searchable interactive tree', 'TypeScript & CSV converters', 'JSONPath query evaluator', 'JSON side-by-side diff', 'Line & syntax error locator']),
        tags: JSON.stringify(['json', 'formatter', 'beautify', 'repair', 'typescript', 'tree-view', 'diff']),
        is_hidden: 0,
        is_upcoming: 0,
        likes_count: 245,
        display_order: 3
      },
      {
        slug: 'md',
        name: 'Markdown Studio Pro',
        url: 'https://md.abishek.in',
        icon: '📝',
        category: 'developer',
        badge: 'Live',
        short_desc: 'Fullscreen GitHub Flavored Markdown editor with live sync preview, KaTeX math formulas, and Mermaid diagrams.',
        long_desc: 'Dual-pane GFM editor with synchronized scrolling, 1-click formatting toolbar, interactive task lists, KaTeX LaTeX math equations, Mermaid flowchart visualizer, table generator, and print-to-PDF export.',
        features: JSON.stringify(['Live dual-pane sync scroll', 'KaTeX math formula rendering', 'Mermaid diagram SVGs', 'HTML to Markdown converter', 'Dynamic table of contents', 'Print and export to PDF']),
        tags: JSON.stringify(['markdown', 'gfm', 'editor', 'katex', 'mermaid', 'notes', 'pdf']),
        is_hidden: 0,
        is_upcoming: 0,
        likes_count: 167,
        display_order: 4
      },
      {
        slug: 'prettier',
        name: 'Prettier Code Studio',
        url: 'https://prettier.abishek.in',
        icon: '✨',
        category: 'formatters',
        badge: 'Live',
        short_desc: 'Professional multi-language code formatter and minifier with Prettier 3 engine and diff comparison.',
        long_desc: 'Beautify and format JavaScript, TypeScript, HTML, CSS, SCSS, JSON, Markdown, YAML, GraphQL, SQL, and Python with customizable formatting rules and side-by-side diff comparison.',
        features: JSON.stringify(['Prettier 3 standalone engine', '10+ programming languages', 'Interactive diff viewer', 'Code minifier mode', 'Auto-detect file extension', 'Customizable tab & semi rules']),
        tags: JSON.stringify(['prettier', 'code-formatter', 'beautifier', 'diff', 'minify', 'javascript']),
        is_hidden: 0,
        is_upcoming: 0,
        likes_count: 210,
        display_order: 5
      },
      {
        slug: 'image',
        name: 'Image Compressor Pro',
        url: 'https://image.abishek.in',
        icon: '🖼️',
        category: 'media',
        badge: 'Live',
        short_desc: 'Ultra-fast client-side image compressor and format converter supporting WebP, AVIF, PNG, and JPEG.',
        long_desc: 'Compress high-resolution photos in bulk with adjustable quality controls, live comparison slider, DPI preservation, and instant download without uploading files to any external server.',
        features: JSON.stringify(['Bulk client-side compression', 'WebP & AVIF conversion', 'Before/After comparison slider', 'Zero server upload (100% private)', 'DPI and metadata retention']),
        tags: JSON.stringify(['image', 'compressor', 'webp', 'avif', 'converter', 'photo']),
        is_hidden: 0,
        is_upcoming: 0,
        likes_count: 312,
        display_order: 6
      },
      {
        slug: 'pdf',
        name: 'PDF Toolkit Studio',
        url: 'https://pdf.abishek.in',
        icon: '📄',
        category: 'media',
        badge: 'Live',
        short_desc: 'Comprehensive PDF suite to merge, split, compress, protect, rotate, and extract pages in browser.',
        long_desc: 'All-in-one browser PDF utility to combine documents, extract specific pages, reduce file size, and password protect PDF files securely.',
        features: JSON.stringify(['Merge multiple PDF files', 'Split and extract pages', 'Client-side PDF compression', 'Rotate and reorganize pages', 'Password encryption']),
        tags: JSON.stringify(['pdf', 'merge', 'split', 'compress', 'document', 'tools']),
        is_hidden: 0,
        is_upcoming: 0,
        likes_count: 280,
        display_order: 7
      },
      {
        slug: 'youtube',
        name: 'YouTube Media Suite',
        url: 'https://youtube.abishek.in',
        icon: '🎥',
        category: 'media',
        badge: 'Live',
        short_desc: 'High-quality YouTube audio and video downloader with MP3 encoding and resolution selection.',
        long_desc: 'Fast YouTube stream processor supporting MP3 audio extraction, full HD video download, and metadata tagging.',
        features: JSON.stringify(['MP3 audio conversion', '1080p & 4K video streams', 'Fast client-side buffering', 'Clean audio tagger']),
        tags: JSON.stringify(['youtube', 'downloader', 'mp3', 'video', 'audio', 'media']),
        is_hidden: 0,
        is_upcoming: 0,
        likes_count: 420,
        display_order: 8
      },
      {
        slug: 'portfolio',
        name: 'Abishek Engineering Hub',
        url: 'https://abishek.in',
        icon: '🚀',
        category: 'utilities',
        badge: 'Portfolio',
        short_desc: 'Engineering portfolio, interactive 3D experiences, blog insights, and technical projects.',
        long_desc: 'The personal developer hub of Abishek V featuring technical writeups, open-source projects, and engineering experiments.',
        features: JSON.stringify(['Three.js 3D web experience', 'Technical portfolio and resume', 'Project showcases and live demos']),
        tags: JSON.stringify(['portfolio', 'profile', 'developer', 'engineering']),
        is_hidden: 0,
        is_upcoming: 0,
        likes_count: 530,
        display_order: 9
      },
      // UPCOMING TOOLS (With "Notify on Launch" support!)
      {
        slug: 'regex',
        name: 'Regex Studio & Explainer',
        url: 'https://regex.abishek.in',
        icon: '🎯',
        category: 'developer',
        badge: 'Upcoming',
        short_desc: 'Interactive regular expression builder, live syntax tester, and plain-English regex explainer.',
        long_desc: 'Build, debug, and test complex regex patterns with live visual match groups, cheat sheet suggestions, and performance benchmarks.',
        features: JSON.stringify(['Live match group visualizer', 'Plain-English pattern explanation', 'Library of common regexes', 'Code snippet generator (JS/Python/Go)']),
        tags: JSON.stringify(['regex', 'regular-expression', 'tester', 'patterns']),
        is_hidden: 0,
        is_upcoming: 1,
        launch_date: 'November 2026',
        likes_count: 88,
        display_order: 10
      },
      {
        slug: 'sql',
        name: 'Visual SQL Query Builder',
        url: 'https://sql.abishek.in',
        icon: '🗄️',
        category: 'developer',
        badge: 'Upcoming',
        short_desc: 'Interactive drag-and-drop SQL query designer and relational schema diagram generator.',
        long_desc: 'Visual database query tool supporting PostgreSQL, MySQL, and SQLite. Draw joins visually, generate optimized queries, and inspect execution plans.',
        features: JSON.stringify(['Visual table relationship mapper', 'JOIN and WHERE visual builder', 'SQL dialect switcher (Postgres, MySQL, SQLite)', 'Mock dataset generator']),
        tags: JSON.stringify(['sql', 'database', 'query-builder', 'schema', 'postgres']),
        is_hidden: 0,
        is_upcoming: 1,
        launch_date: 'December 2026',
        likes_count: 114,
        display_order: 11
      },
      {
        slug: 'svg',
        name: 'SVG Optimizer & Path Studio',
        url: 'https://svg.abishek.in',
        icon: '🎨',
        category: 'media',
        badge: 'Upcoming',
        short_desc: 'Vector SVG cleaner, SVGO compressor, coordinate editor, and React SVG component generator.',
        long_desc: 'Strip unnecessary metadata from SVGs, optimize vector curves, preview in dark/light stages, and convert directly to JSX/React components.',
        features: JSON.stringify(['SVGO lossy/lossless optimization', 'Visual path point editor', 'JSX & Vue component export', 'CSS fill and stroke customizer']),
        tags: JSON.stringify(['svg', 'vector', 'optimizer', 'icons', 'design']),
        is_hidden: 0,
        is_upcoming: 1,
        launch_date: 'December 2026',
        likes_count: 73,
        display_order: 12
      },
      {
        slug: 'colors',
        name: 'Palette & Contrast Studio',
        url: 'https://color.abishek.in',
        icon: '🌈',
        category: 'utilities',
        badge: 'Upcoming',
        short_desc: 'Accessible color palette generator with WCAG 2.2 contrast checking and Tailwind scale exports.',
        long_desc: 'Generate harmonized color schemes, verify AAA/AA accessibility compliance against text and background colors, and export Tailwind theme configurations.',
        features: JSON.stringify(['WCAG 2.2 contrast ratio checker', 'Tailwind 50-950 shade generator', 'Color blindness simulator', 'Export to CSS Variables, SCSS, JSON']),
        tags: JSON.stringify(['color', 'palette', 'accessibility', 'wcag', 'tailwind']),
        is_hidden: 0,
        is_upcoming: 1,
        launch_date: 'January 2027',
        likes_count: 65,
        display_order: 13
      }
    ];

    for (const t of defaultTools) {
      await database.run(
        `INSERT INTO tools (slug, name, url, icon, category, badge, short_desc, long_desc, features, tags, is_hidden, is_upcoming, launch_date, likes_count, display_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [t.slug, t.name, t.url, t.icon, t.category, t.badge, t.short_desc, t.long_desc, t.features, t.tags, t.is_hidden, t.is_upcoming, t.launch_date || null, t.likes_count, t.display_order]
      );
    }
  }
}
