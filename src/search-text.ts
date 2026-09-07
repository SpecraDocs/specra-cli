// Extract searchable plain text from MDX. Ported from specra's
// componentTextProps (kept in sync) so the CLI indexer produces the same
// searchable text the docs site would. Pure — no runtime dependencies.

/** Which props of each component hold human-readable, searchable text. */
export const COMPONENT_TEXT_PROPS: Record<string, string[]> = {
  // Accordion components
  Accordion: ['title'],
  AccordionItem: ['title'],

  // Alert/Callout components
  Alert: ['title', 'description'],
  Banner: ['title'],
  Callout: ['title', 'content'],
  Note: ['title'],
  Warning: ['title', 'text'],

  // Navigation components
  BreadCrumb: ['title', 'slug', 'version'],

  // Card components
  Card: ['title', 'description'],
  ImageCard: ['title', 'description', 'alt'],

  // Media components
  Image: ['alt', 'caption'],
  Video: ['caption'],
  Frame: ['title'],
  Mermaid: ['caption'],

  // Interactive components
  Tooltip: ['content'],

  // Code components
  CodeBlock: ['filename'],

  // Step components
  Step: ['title'],

  // Timeline components
  TimelineItem: ['title', 'date'],
}

/** Pull the searchable prop values out of self-closing component tags. */
export function extractComponentPropsText(mdx: string): string {
  return mdx.replace(/<([A-Z][\w]*)\b([^/>]*)\/>/g, (_, component, props) => {
    const searchableProps = COMPONENT_TEXT_PROPS[component]
    if (!searchableProps) return ' '

    let extracted = ''
    for (const prop of searchableProps) {
      const match = props.match(new RegExp(`${prop}="([^"]+)"`, 'i'))
      if (match) extracted += ' ' + match[1]
    }
    return extracted || ' '
  })
}

/** Reduce MDX to a plain-text string suitable for full-text indexing. */
export function extractSearchText(mdx: string): string {
  return (
    extractComponentPropsText(mdx)
      // Remove fenced code blocks
      .replace(/```[\s\S]*?```/g, ' ')
      // Remove JSX blocks with children
      .replace(/<([A-Z][\w]*)\b[^>]*>[\s\S]*?<\/\1>/g, ' ')
      // Remove remaining JSX & HTML
      .replace(/<\/?[A-Za-z][^>]*>/g, ' ')
      // Remove inline code
      .replace(/`[^`]+`/g, ' ')
      // Remove markdown links (keep the text)
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove markdown noise
      .replace(/[#>*_~=-]+/g, ' ')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 1000)
  )
}
