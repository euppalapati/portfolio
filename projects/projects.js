import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

async function loadProjects() {
    const projects = await fetchJSON('../lib/projects.json');
    const projectsContainer = document.querySelector('.projects');
    renderProjects(projects, projectsContainer, 'h2');

    renderPieChart(projects);

    window.addEventListener("resize", function () {
        let width = Math.min(window.innerWidth * 0.4, 300);
        let height = width;

        d3.select("#projects-pie-plot")
            .attr("width", width)
            .attr("height", height);
    });

    return projects;
}
let selectedIndex = -1;
let selectedYear = null;

function renderPieChart(projectsGiven) {
    let svg = d3.select('svg');
    svg.selectAll('path').remove();

    let legend = d3.select('.legend');
    legend.selectAll('li').remove();

    let rolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year
    );

    let data = rolledData.map(([year, count]) => {
        return { value: count, label: year };
    });

    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let sliceGenerator = d3.pie().value((d) => d.value);
    let arcData = sliceGenerator(data);
    let arcs = arcData.map((d) => arcGenerator(d));
    let colors = d3.scaleOrdinal(["#fe8e84", "#ffe387", "#ace1af", "#80aed7"]);

    arcs.forEach((arc, idx) => {
        svg.append('path')
            .attr('d', arc)
            .attr('fill', colors(idx))
            .attr('class', 'pie-slice')
            .on('click', () => {
                selectedIndex = selectedIndex === idx ? -1 : idx;
                selectedYear = selectedIndex === -1 ? null : data[idx].label;

                svg
                    .selectAll('path')
                    .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''));

                legend
                    .selectAll('li')
                    .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''));

                filterProjects();
            });
    });

    data.forEach((d, idx) => {
        legend.append('li')
            .attr('style', `--color:${colors(idx)}`)
            .attr('class', 'legend-item')
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
}

function filterProjects() {
  const projectsContainer = document.querySelector('.projects');
  
  let filteredProjects = projects;
  filteredProjects = filteredProjects.filter((project) => {

    let matchesYear = selectedIndex === -1 || project.year === selectedYear;    
    let matchesQuery = query === '' || Object.values(project).join('\n').toLowerCase().includes(query.toLowerCase());

    return matchesQuery && matchesYear;
  });

  projectsContainer.innerHTML = '';
  renderProjects(filteredProjects, projectsContainer, 'h2');
}

let projects = await loadProjects();

let query = '';
let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
    // update query value
    query = event.target.value.toLowerCase();

    // filter projects
    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query);
    });

    // render filtered projects
    const projectsContainer = document.querySelector('.projects');
    projectsContainer.innerHTML = '';
    
    renderProjects(filteredProjects, projectsContainer, 'h2');
});
