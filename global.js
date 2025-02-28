console.log('hello!');

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
    { url: 'meta/', title: 'Meta' },
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

document.addEventListener('DOMContentLoaded', () => {
  const select = document.querySelector('.color-scheme');

  if ("colorScheme" in localStorage) {
    const savedScheme = localStorage.colorScheme;
    document.documentElement.style.setProperty('color-scheme', savedScheme);
    select.value = savedScheme;
  }

  select.addEventListener('input', function (event) {
    const selectedScheme = event.target.value;
    console.log('Color scheme changed to:', selectedScheme);

    localStorage.colorScheme = selectedScheme;

    document.documentElement.style.setProperty('color-scheme', selectedScheme);
  });
});

// form?.addEventListener('submit', (event) => {
//     event.preventDefault();

//     const data = new FormData(form);
//     let url = form.action + "?";

//     for (let [name, value] of data) {
//       url += `${encodeURIComponent(name)}=${encodeURIComponent(value)}&`;
//     }

//     url = url.slice(0, -1);
//     console.log("Encoded URL:", url);

//     location.href = url;
//   });

  const form = document.querySelector('form');

form?.addEventListener('submit', (event) => {
  event.preventDefault();

  const data = new FormData(form);
  let url = form.action + "?";

  for (let [name, value] of data) {
    url += `${encodeURIComponent(name)}=${encodeURIComponent(value)}&`;
  }

  url = url.slice(0, -1);

  console.log("Encoded URL:", url);

  location.href = url;
});

export async function fetchJSON(url) {
  try {
      // Fetch the JSON file from the given URL
      const response = await fetch(url);

      console.log(response);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    
      const data = await response.json();
      return data; 

  } catch (error) {
      console.error('Error fetching or parsing JSON data:', error);
  }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  containerElement.innerHTML = '';

  const projectsTitle = document.querySelector('.projects-title');
  if (projectsTitle) {
    projectsTitle.textContent = `${projects.length} Projects`;
  }

  if (!projects || projects.length === 0) {
    containerElement.innerHTML = '<p>No projects available.</p>';
    return;
  }

  projects.forEach(project => {
    const article = document.createElement('article');
    article.innerHTML = `
      <${headingLevel}>${project.title}</${headingLevel}>
      <img src="${project.image}" alt="${project.title}">
      <p>${project.description} <span class="year">${project.year}</span></p>
    `;
    containerElement.appendChild(article);
  });
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}