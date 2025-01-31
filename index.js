import { fetchJSON, renderProjects, } from './global.js';
console.log("index.js is running");
async function loadLatestProjects() {
    const projects = await fetchJSON('./lib/projects.json');
    console.log(projects);
    const latestProjects = projects.slice(0, 3);
    const projectsContainer = document.querySelector('.projects');
    renderProjects(latestProjects, projectsContainer, 'h2');
}

loadLatestProjects();