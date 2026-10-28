// All interactions are progressive enhancements. The page remains readable with JS disabled.
const menuToggle = document.querySelector('#menuToggle');
const mobileMenu = document.querySelector('#mobileMenu');

function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open menu');
  mobileMenu.hidden = true;
  document.body.classList.remove('menu-open');
}

menuToggle.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!expanded));
  menuToggle.setAttribute('aria-label', expanded ? 'Open menu' : 'Close menu');
  mobileMenu.hidden = expanded;
  document.body.classList.toggle('menu-open', !expanded);
});
mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
window.addEventListener('resize', () => { if (window.innerWidth > 980) closeMenu(); });

const navLinks = [...document.querySelectorAll('.desktop-nav a')];
const trackedSections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio);
    if (!visible.length) return;
    navLinks.forEach(link => link.classList.toggle('active', link.hash === `#${visible[0].target.id}`));
  }, { rootMargin: '-20% 0px -55% 0px', threshold: [0,.1,.4] });
  trackedSections.forEach(section => observer.observe(section));
}

// Photo gallery made using photographs from the assignment reference homepage.
const galleryPhotos = [
  {src:"/images/mountain-falls-pond.jpg", alt:"Mountain Falls pond and mountain landscape", caption:"Mountain Falls, Pahrump"},
  {src:"/images/luxury-home.jpg", alt:"Modern white luxury home with a pool", caption:"Contemporary living"},
  {src:"/images/interior-kitchen.jpg", alt:"Modern kitchen with bright open-plan living", caption:"Interior inspiration"},
  {src:"/images/poolside-home.jpg", alt:"Mediterranean-style home with swimming pool", caption:"Outdoor living"},
  {src:"/images/home-keys.jpg", alt:"House keys on rustic wooden table", caption:"The next chapter"},
  {src:"/images/living-room.jpg", alt:"Cozy living room details and coffee table", caption:"A place to unwind"},
  {src:"/images/architecture.jpg", alt:"Modern home exterior with lawn and views", caption:"Home design"},
  {src:"/images/client-handshake.jpg", alt:"Client and agent shaking hands during a consultation", caption:"A personal approach"}
];
let currentPhoto = 0;
const galleryMain = document.querySelector('#galleryMain');
const galleryCaption = document.querySelector('#galleryCaption');
const galleryCounter = document.querySelector('#galleryCounter');
const galleryThumbnails = document.querySelector('#galleryThumbnails');

function showGalleryPhoto(index) {
  currentPhoto = (index + galleryPhotos.length) % galleryPhotos.length;
  const photo = galleryPhotos[currentPhoto];
  galleryMain.src = photo.src;
  galleryMain.alt = photo.alt;
  galleryCaption.textContent = photo.caption;
  galleryCounter.textContent = `${String(currentPhoto+1).padStart(2,'0')} / ${String(galleryPhotos.length).padStart(2,'0')}`;
  galleryThumbnails.querySelectorAll('button').forEach((button,i) => button.setAttribute('aria-pressed', String(i === currentPhoto)));
}
galleryPhotos.forEach((photo,index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'thumbnail';
  button.setAttribute('aria-label', `Show image ${index+1}: ${photo.alt}`);
  const img = document.createElement('img');
  img.src = photo.src;
  img.alt = '';
  img.loading = 'lazy';
  button.append(img);
  button.addEventListener('click', () => showGalleryPhoto(index));
  galleryThumbnails.append(button);
});
document.querySelector('#galleryPrev').addEventListener('click', () => showGalleryPhoto(currentPhoto-1));
document.querySelector('#galleryNext').addEventListener('click', () => showGalleryPhoto(currentPhoto+1));
showGalleryPhoto(0);

// Home search collects meaningful preferences without pretending to have a
// real estate listings API. Visitors can browse live listings or email the agent.
const searchForm = document.querySelector('#searchForm');
const searchError = document.querySelector('#searchError');
const searchResults = document.querySelector('#searchResults');
const emailCriteria = document.querySelector('#emailCriteria');
searchForm.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(searchForm);
  const minPrice = Number(data.get('min') || 0);
  const maxPrice = Number(data.get('max') || 0);
  if (maxPrice > 0 && minPrice > maxPrice) {
    searchError.textContent = 'Maximum price should be greater than or equal to minimum price.';
    searchError.hidden = false;
    searchForm.elements.max.focus();
    searchResults.hidden = true;
    return;
  }
  searchError.hidden = true;
  const money = n => n ? `$${Number(n).toLocaleString('en-US')}` : 'Any';
  const criteria = [
    `Location: ${data.get('location')}`,
    `Type: ${data.get('type')}`,
    `Sort: ${data.get('sort')}`,
    `Bedrooms: ${data.get('beds')}`,
    `Bathrooms: ${data.get('baths')}`,
    `Minimum price: ${money(data.get('min'))}`,
    `Maximum price: ${money(data.get('max'))}`
  ];
  document.querySelector('#criteriaText').textContent = `${data.get('location')} · ${data.get('type')} · ${data.get('beds')} bedrooms · ${money(data.get('min'))}–${money(data.get('max'))}`;
  emailCriteria.href = `mailto:marcimetzger@gmail.com?subject=${encodeURIComponent('My Pahrump Property Search - Attn: Marci Metzger')}&body=${encodeURIComponent(`Hello Marci,\n\nI'd like to learn about matching properties.\n\n${criteria.join('\n')}\n\nThank you!`)}`;
  searchResults.hidden = false;
  searchResults.focus({ preventScroll:true });
  searchResults.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'nearest' });
});

// No contact backend is configured for this static assessment website.
// The button clearly opens the visitor's own email client; it does NOT
// falsely claim the message was submitted or sent.
const contactForm = document.querySelector('#contactForm');
contactForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;
  const data = new FormData(contactForm);
  const subject = `Real Estate Inquiry - ${data.get('interest')}`;
  const body = [
    `Name: ${data.get('name')}`,
    `Email: ${data.get('email')}`,
    `Interested in: ${data.get('interest')}`,
    '',
    String(data.get('message')),
    '',
    'Sent from the Marci Metzger homepage concept.'
  ].join('\n');
  const emailLink = `mailto:marcimetzger@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = emailLink;
  document.querySelector('#contactStatus').textContent = 'Your email application should open with the prepared message. Please review it and press Send there; this website has not submitted a message.';
});

document.querySelector('#year').textContent = String(new Date().getFullYear());
