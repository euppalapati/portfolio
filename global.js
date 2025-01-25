console.log('step 4');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// const navLinks = $$("nav a")

// let currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname
//   );

// currentLink?.classList.add('current');

let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact' },
    { url: 'cv/', title: 'CV' },
    { url: 'https://github.com/euppalapati', title: 'GitHub' },
  ];

const ARE_WE_HOME = document.documentElement.classList.contains('home');

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
    let url = p.url;
    let title = p.title;
  
    url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;
  
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
  
    a.classList.toggle(
      'current',
      a.host === location.host && a.pathname === location.pathname
    );
  
    a.target = a.host !== location.host ? '_blank' : '';
  
    nav.append(a);
  }

document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <div class="color-scheme">
      <label for="color-scheme" class="color-scheme">
        Theme:
      </label>
      <select id="color-scheme" class="color-scheme">
        <option value="light dark">Automatic</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
    `
  );
  
// const colorSchemeSelect = document.getElementById('color-scheme');
  
// colorSchemeSelect.addEventListener('change', (event) => {
//   const value = event.target.value;
//   const root = document.documentElement;
  
//   root.style.colorScheme = value;
//   });

const select = document.querySelector('.color-scheme');

select.addEventListener('input', function (event) {
  console.log('Color scheme changed to:', event.target.value);
  document.documentElement.style.setProperty('color-scheme', event.target.value);
});

form?.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = new FormData(form);
    let url = form.action + "?";

    // Iterate over the form data
    for (let [name, value] of data) {
      url += `${encodeURIComponent(name)}=${encodeURIComponent(value)}&`;
    }

    url = url.slice(0, -1);
    console.log("Encoded URL:", url);

    location.href = url;
  });