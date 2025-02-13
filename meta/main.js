let data = [];
let commits = [];
let xScale, yScale;

async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: Number(row.line), // or just +row.line
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));

    processCommits();
    console.log(data);
    displayStats();
    console.log(commits);
  }

// let commits = d3.groups(data, (d) => d.commit);

function processCommits() {
    commits = d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        let first = lines[0];
  
        let { author, date, time, timezone, datetime } = first;
  
        let ret = {
          id: commit,
          url: 'https://github.com/YOUR_REPO/commit/' + commit,
          author,
          date,
          time,
          timezone,
          datetime,
          hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
          totalLines: lines.length,
        };
  
        Object.defineProperty(ret, 'lines', {
          value: lines,
          writable: false,
          enumerable: false,
          configurable: false,
        });
  
        return ret;
      });
  }

  function mostActiveTimeOfDay(data) {
    const timeOfDayCounts = d3.rollup(data, (v) => v.length, (d) => {
      const hour = new Date(d.datetime).getHours();
      if (hour < 6) return 'Night';
      if (hour < 12) return 'Morning';
      if (hour < 18) return 'Afternoon';
      return 'Evening';
    });
  
    // Convert the InternMap to a plain object to make sorting easier
    const timeOfDayEntries = Array.from(timeOfDayCounts.entries());
    console.log("Time of Day Entries:", timeOfDayEntries);
  
    // Sort by value (the count of occurrences)
    const sortedTimeOfDay = timeOfDayEntries.sort((a, b) => b[1] - a[1]);
    console.log("Sorted Time of Day:", sortedTimeOfDay);
  
    // Get the most active period
    const mostActivePeriod = sortedTimeOfDay.length > 0 ? sortedTimeOfDay[0][0] : 'Unknown';
  
    return mostActivePeriod;
  }
  
  function mostActiveDayOfWeek(data) {
    const dayOfWeekCounts = d3.rollup(data, (v) => v.length, (d) => new Date(d.datetime).getDay());
  
    // Convert the InternMap to a plain object to make sorting easier
    const dayOfWeekEntries = Array.from(dayOfWeekCounts.entries());
    console.log("Day of Week Entries:", dayOfWeekEntries);
  
    // Sort by value (the count of occurrences)
    const sortedDayOfWeek = dayOfWeekEntries.sort((a, b) => b[1] - a[1]);
    console.log("Sorted Day of Week:", sortedDayOfWeek);
  
    // Get the most active day
    const mostActiveDay = sortedDayOfWeek.length > 0 ? sortedDayOfWeek[0][0] : -1;
  
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return mostActiveDay >= 0 ? dayNames[mostActiveDay] : 'Unknown';
  }

  function displayStats() {
    // Process commits first
    processCommits();
  
    // Create the dl element
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');
  
    // Add total LOC
    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(data.length);
  
    // Add total commits
    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);
  
    // Add Average Line Length
    const avgLineLength = d3.mean(data, (d) => d.length);
    dl.append('dt').text('Average line length');
    dl.append('dd').text(avgLineLength.toFixed(2));

    // Add Most Active Time of Day
    const mostActivePeriod = mostActiveTimeOfDay(data);
    dl.append('dt').text('Most active time');
    dl.append('dd').text(mostActivePeriod);

    // Add Most Active Day of the Week
    const mostActiveDay = mostActiveDayOfWeek(data);
    dl.append('dt').text('Most active day');
    dl.append('dd').text(mostActiveDay);
  }

  async function createScatter() {
  const width = 1000;
  const height = 600;

  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, width])
    .nice();

  yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

    const margin = { top: 10, right: 10, bottom: 30, left: 20 };

    const usableArea = {
      top: margin.top,
      right: width - margin.right,
      bottom: height - margin.bottom,
      left: margin.left,
      width: width - margin.left - margin.right,
      height: height - margin.top - margin.bottom,
    };
    
    // Update scales with new ranges
    xScale.range([usableArea.left, usableArea.right]);
    yScale.range([usableArea.bottom, usableArea.top]);

    // Add gridlines BEFORE the axes
const gridlines = svg
.append('g')
.attr('class', 'gridlines')
.attr('transform', `translate(${usableArea.left}, 0)`);

// Create gridlines as an axis with no labels and full-width ticks
gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

const dots = svg.append('g').attr('class', 'dots');

const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);

const rScale = d3
  .scaleSqrt() // Change only this line
  .domain([minLines, maxLines])
  .range([2, 30]);

  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

dots
  .selectAll('circle')
  .data(sortedCommits)
  .join('circle')
  .attr('cx', (d) => xScale(d.datetime))
  .attr('cy', (d) => yScale(d.hourFrac))
  .attr('r', (d) => rScale(d.totalLines))
  .attr('class', 'custom-dot')
  .style('fill-opacity', 0.6) // Add transparency for overlapping dots
  .on('mouseenter', (event, commit) => {
    d3.select(event.currentTarget).style('fill-opacity', 1);
    updateTooltipContent(commit);
    updateTooltipVisibility(true);
    updateTooltipPosition(event);
  })
  .on('mousemove', (event) => {
    updateTooltipPosition(event);
  })
  .on('mouseleave', function (event) {
    d3.select(event.currentTarget).style('fill-opacity', 0.6);
    updateTooltipContent({});
    updateTooltipVisibility(false);
  });

    // Create the axes
const xAxis = d3.axisBottom(xScale);
const yAxis = d3
  .axisLeft(yScale)
  .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

// Add X axis
svg
  .append('g')
  .attr('transform', `translate(0, ${usableArea.bottom})`)
  .call(xAxis);

// Add Y axis
svg
  .append('g')
  .attr('transform', `translate(${usableArea.left}, 0)`)
  .call(yAxis);

  brushSelector();
  }

  function updateTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
    const time = document.getElementById('commit-time');
    const author = document.getElementById('commit-author');
    const linesEdited = document.getElementById('commit-lines-edited');
  
    if (Object.keys(commit).length === 0) return;
  
    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString('en', { dateStyle: 'full' });
    time.textContent = commit.datetime?.toLocaleString('en', { timeStyle: 'short' });
    author.textContent = commit.author;
    linesEdited.textContent = commit.totalLines || 'N/A';
  }

  function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
  }

  function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
  }

  let brushSelection = null;

function brushed(event) {
  brushSelection = event.selection;
  updateSelection();
  updateSelectionCount();
}

function isCommitSelected(commit) {
  if (!brushSelection) {
    return false;
  }

  // Get the bounds of the brush selection
  const min = {
    x: brushSelection[0][0], // min x (left)
    y: brushSelection[0][1], // min y (top)
  };
  const max = {
    x: brushSelection[1][0], // max x (right)
    y: brushSelection[1][1], // max y (bottom)
  };

  // Get the commit's x and y coordinates in the chart
  const x = xScale(commit.datetime); // Use commit's datetime for x position
  const y = yScale(commit.hourFrac); // Use commit's hourFrac for y position

  // Check if the commit is within the brush selection's bounds
  return (
    x >= min.x && x <= max.x && // Commit's x is between min and max x
    y >= min.y && y <= max.y    // Commit's y is between min and max y
  );
}

function updateSelection() {
  // Update visual state of dots based on selection
  d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));
}

function updateSelectionCount() {
  const selectedCommits = brushSelection
    ? commits.filter(isCommitSelected)
    : [];

  const countElement = document.getElementById('selection-count');
  countElement.textContent = `${
    selectedCommits.length || 'No'
  } commits selected`;

  return selectedCommits;
}

  function brushSelector() {
    const svg = document.querySelector('svg');
    // Create brush
  d3.select(svg).call(d3.brush());

  // Raise dots and everything after overlay
  d3.select(svg).selectAll('.dots, .overlay ~ *').raise();

  d3.select(svg).call(d3.brush().on('start brush end', brushed));
  }

  document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    console.log(commits);
    await createScatter();
  });