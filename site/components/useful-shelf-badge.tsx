// UsefulShelf listing badge. The free dofollow listing goes private if this
// link is removed or gets rel="nofollow", "sponsored" or "ugc".
export function UsefulShelfBadge() {
  return (
    <a
      href="https://usefulshelf.co/?utm_source=graphcomp.reagent-systems.com&amp;utm_medium=referral&amp;utm_campaign=badge&amp;utm_content=lime"
      target="_blank"
      rel="noopener"
    >
      <img
        src="https://usefulshelf.co/badge/usefulshelf.svg?theme=lime"
        alt="Featured on UsefulShelf"
        width={248}
        height={66}
      />
    </a>
  )
}
