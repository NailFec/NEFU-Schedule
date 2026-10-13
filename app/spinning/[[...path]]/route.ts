import { readFile, stat } from "node:fs/promises"
import path from "node:path"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const spinningRoot = path.resolve(
  process.env.SPINNING_ROOT ?? path.join(process.cwd(), "..", "nefu-spinning")
)

const types: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
}

type Context = {
  params: Promise<{ path?: string[] }>
}

function notFound(message = "Not found.") {
  return new Response(message, {
    status: 404,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  })
}

function isAllowed(relativePath: string) {
  return (
    relativePath === "index.html" ||
    relativePath === "styles.css" ||
    relativePath === "spin.js" ||
    /^data\/[1-4]\/members\.json$/.test(relativePath) ||
    /^data\/[1-4]\/avatars\/[^/]+\.(gif|jpe?g|png|webp)$/.test(relativePath)
  )
}

function resolveFile(segments: string[]) {
  const decoded = segments.map((segment) => {
    try {
      return decodeURIComponent(segment)
    } catch {
      return segment
    }
  })

  if (
    decoded.some(
      (segment) =>
        segment === "" ||
        segment === "." ||
        segment === ".." ||
        segment.includes("/") ||
        segment.includes("\\") ||
        segment.includes("\0")
    )
  ) {
    return null
  }

  const relativePath = decoded.length === 0 ? "index.html" : decoded.join("/")
  if (!isAllowed(relativePath)) return null

  const full = path.resolve(spinningRoot, relativePath)
  const rootWithSep = spinningRoot.endsWith(path.sep)
    ? spinningRoot
    : spinningRoot + path.sep
  if (!full.startsWith(rootWithSep)) return null
  return { full, relativePath }
}

export async function GET(request: Request, context: Context) {
  const { path: segments = [] } = await context.params
  const resolved = resolveFile(segments)
  if (!resolved) {
    if (segments.length === 0) {
      return notFound(
        "The spinning page is not available. Expected the nefu-spinning directory next to NEFU-Schedule, or set SPINNING_ROOT."
      )
    }
    return notFound()
  }

  let info
  try {
    info = await stat(resolved.full)
  } catch {
    if (resolved.relativePath === "index.html") {
      return notFound(
        "The spinning page is not available. Expected the nefu-spinning directory next to NEFU-Schedule, or set SPINNING_ROOT."
      )
    }
    return notFound()
  }

  if (!info.isFile()) return notFound()

  const etag = `W/"${Math.round(info.mtimeMs).toString(16)}-${info.size.toString(16)}"`
  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers: { ETag: etag } })
  }

  const body = await readFile(resolved.full)
  const ext = path.extname(resolved.full).toLowerCase()
  const image = ext === ".gif" || ext === ".jpeg" || ext === ".jpg" || ext === ".png" || ext === ".webp"
  const headers: Record<string, string> = {
    "Cache-Control": image ? "public, max-age=300" : "no-cache",
    "Content-Type": types[ext] ?? "application/octet-stream",
    ETag: etag,
    "X-Content-Type-Options": "nosniff",
  }

  if (ext === ".html") {
    headers["Content-Security-Policy"] =
      "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; font-src 'none'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'"
  }

  return new Response(new Uint8Array(body), { status: 200, headers })
}
