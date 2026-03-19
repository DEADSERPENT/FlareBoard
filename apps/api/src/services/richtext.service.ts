import DOMPurify from 'isomorphic-dompurify'

export class RichTextService {
  /**
   * Sanitize HTML to prevent XSS attacks
   * Only allows safe tags and attributes
   */
  sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'strong', 'em', 'u', 's', 'mark',
        'a', 'code', 'pre', 'blockquote',
        'img', 'br', 'hr',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'span', 'div'
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title',
        'class', 'id',
        'target', 'rel'
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    })
  }

  /**
   * Convert plain text to HTML paragraphs
   * Used for backward compatibility with old plain text content
   */
  textToHtml(text: string): string {
    if (!text || text.trim() === '') {
      return ''
    }

    // Split by double newlines to create paragraphs
    const paragraphs = text
      .split(/\n\n+/)
      .filter(p => p.trim() !== '')
      .map(p => {
        // Replace single newlines with <br>
        const content = p.replace(/\n/g, '<br>')
        return `<p>${content}</p>`
      })

    return paragraphs.join('')
  }

  /**
   * Strip HTML tags to get plain text
   * Useful for search indexing and previews
   */
  htmlToText(html: string): string {
    if (!html) return ''

    // Remove HTML tags
    let text = html.replace(/<[^>]*>/g, '')

    // Decode common HTML entities
    const entities: Record<string, string> = {
      '&lt;': '<',
      '&gt;': '>',
      '&amp;': '&',
      '&quot;': '"',
      '&apos;': "'",
      '&nbsp;': ' ',
    }

    for (const [entity, char] of Object.entries(entities)) {
      text = text.replace(new RegExp(entity, 'g'), char)
    }

    return text.trim()
  }

  /**
   * Validate that HTML content is not empty
   */
  isHtmlEmpty(html: string): boolean {
    if (!html) return true

    // Remove HTML tags and whitespace
    const text = html.replace(/<[^>]*>/g, '').trim()
    return text === ''
  }

  /**
   * Truncate HTML content to a specified length
   * Useful for previews and summaries
   */
  truncateHtml(html: string, maxLength: number): string {
    if (!html) return ''

    const text = this.htmlToText(html)
    if (text.length <= maxLength) return html

    const truncated = text.substring(0, maxLength).trim() + '...'
    return `<p>${truncated}</p>`
  }
}

export const richTextService = new RichTextService()
