/**
 * Sanity.io Headless CMS Client & Renderer
 * Dr. Karpe's Centre for Advanced Dentistry
 */

const sanityConfig = {
  projectId: 'rp2xmfmw', // Replace with your Sanity Project ID
  dataset: 'production',         // Replace with your dataset (usually 'production')
  useCdn: true,                  // High performance CDN cache
  apiVersion: '2021-10-21'
};

// Fallback static posts to show if Sanity is not configured or offline
const fallbackPosts = [
  {
    title: "How To Save Your Childs Teeth?",
    slug: { current: "how-to-save-your-child-teeth" },
    category: "Pediatric Care",
    excerpt: "Keeping your child's milk teeth healthy is essential for their permanent teeth development and general health. Learn pediatric brushing techniques, optimal diet patterns, and how to prepare your child for their first dentist visit.",
    mainImageUrl: "assets/img/blog/how-to-save-your-child-teeth.jpg",
    publishedAt: "2026-06-23T00:00:00.000Z",
    isStatic: true,
    staticUrl: "how-to-save-your-child-teeth.html"
  },
  {
    title: "What Is Next After Tooth Removal?",
    slug: { current: "What-is-next-after-tooth-removal" },
    category: "Restorative Dentistry",
    excerpt: "Losing a tooth has serious side-effects: facial sagging, bone resorption, chewing difficulties, and adjacent teeth shifting out of place. Discover artificial options like dentures, bridges, and advanced dental implants.",
    mainImageUrl: "assets/img/blog/What-is-next-after-tooth-removal.jpg",
    publishedAt: "2026-06-18T00:00:00.000Z",
    isStatic: true,
    staticUrl: "What-is-next-after-tooth-removal.html"
  },
  {
    title: "Get It Done Or It Will Be Too Late!",
    slug: { current: "Get-it-done-or-it-will-be-too-late" },
    category: "Oral Hygiene",
    excerpt: "Teeth are an integral part of the body. Tooth is covered by a layer called ‘ENAMEL’ which once get destroyed cannot be regained. Learn how early tooth fillings prevent deep rot, root canal pain, and eventual tooth loss.",
    mainImageUrl: "assets/img/blog/get-it-done.jpg",
    publishedAt: "2026-06-12T00:00:00.000Z",
    isStatic: true,
    staticUrl: "Get-it-done-or-it-will-be-too-late.html"
  }
];

// Helper to build Sanity CDN image URLs
function buildImageUrl(imageAsset) {
  if (!imageAsset || !imageAsset.asset || !imageAsset.asset._ref) return '';
  const ref = imageAsset.asset._ref;
  
  // Format: image-c3f97c532e213b3b28b6d8b2d1847124f2b968c9-1349x650-jpg
  const parts = ref.split('-');
  if (parts.length < 4) return '';
  
  const assetId = parts[1];
  const dimensions = parts[2];
  const ext = parts[3];
  
  return `https://cdn.sanity.io/images/${sanityConfig.projectId}/${sanityConfig.dataset}/${assetId}-${dimensions}.${ext}`;
}

// Convert Sanity Portable Text Blocks to Semantic HTML
function renderPortableText(blocks) {
  if (!blocks || !Array.isArray(blocks)) return '';
  
  const escapeHtml = (text) => {
    if (!text) return '';
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const rawItems = blocks.map(block => {
    // Handle image blocks inside rich text
    if (block._type === 'image') {
      const imageUrl = buildImageUrl(block);
      if (!imageUrl) return '';
      return `<div class="article-body-image reveal" style="margin: 2rem 0; text-align: center;">
                <img src="${imageUrl}" alt="${block.alt || 'Blog Image'}" style="max-width:100%; border-radius:8px;" />
              </div>`;
    }
    
    if (block._type !== 'block') return '';
    
    const style = block.style || 'normal';
    const childrenHtml = block.children.map(child => {
      if (child._type !== 'span') return '';
      let text = escapeHtml(child.text);
      
      // Apply marks (bold, italic, links)
      if (child.marks && child.marks.length > 0) {
        child.marks.forEach(mark => {
          if (mark === 'strong') {
            text = `<strong>${text}</strong>`;
          } else if (mark === 'em') {
            text = `<em>${text}</em>`;
          }
          
          // Check for link definitions
          const markDef = block.markDefs && block.markDefs.find(def => def._key === mark);
          if (markDef && markDef._type === 'link') {
            text = `<a href="${escapeHtml(markDef.href)}" target="_blank" rel="noopener">${text}</a>`;
          }
        });
      }
      return text;
    }).join('');
    
    // Handle lists
    if (block.listItem) {
      return { type: 'list-item', itemType: block.listItem, html: `<li>${childrenHtml}</li>` };
    }
    
    // Handle typography styles
    switch (style) {
      case 'h2':
        return `<h2>${childrenHtml}</h2>`;
      case 'h3':
        return `<h3>${childrenHtml}</h3>`;
      case 'blockquote':
        return `<blockquote>${childrenHtml}</blockquote>`;
      default:
        return `<p>${childrenHtml}</p>`;
    }
  });

  // Group list items into <ul> or <ol>
  let outputHtml = '';
  let activeListType = null;
  
  rawItems.forEach(item => {
    if (!item) return;
    
    if (typeof item === 'object' && item.type === 'list-item') {
      const listTag = item.itemType === 'number' ? 'ol' : 'ul';
      if (!activeListType) {
        activeListType = item.itemType;
        outputHtml += `<${listTag}>`;
      } else if (activeListType !== item.itemType) {
        const prevTag = activeListType === 'number' ? 'ol' : 'ul';
        outputHtml += `</${prevTag}><${listTag}>`;
        activeListType = item.itemType;
      }
      outputHtml += item.html;
    } else {
      if (activeListType) {
        const listTag = activeListType === 'number' ? 'ol' : 'ul';
        outputHtml += `</${listTag}>`;
        activeListType = null;
      }
      outputHtml += item;
    }
  });
  
  if (activeListType) {
    const listTag = activeListType === 'number' ? 'ol' : 'ul';
    outputHtml += `</${listTag}>`;
  }
  
  return outputHtml;
}

// Fetch helper to query Sanity API
async function fetchSanity(query) {
  if (!sanityConfig.projectId || sanityConfig.projectId === 'YOUR_PROJECT_ID') {
    console.warn("Sanity Project ID not set. Operating in offline/fallback mode.");
    return null;
  }
  
  const url = `https://${sanityConfig.projectId}.apicdn.sanity.io/v${sanityConfig.apiVersion}/data/query/${sanityConfig.dataset}?query=${encodeURIComponent(query)}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Sanity API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error("Failed to fetch from Sanity API. Falling back to local data.", error);
    return null;
  }
}

// Format ISO date to Human Readable
function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
