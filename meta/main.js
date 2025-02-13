let data = [];
let commits = [];

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
  
  document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
  });