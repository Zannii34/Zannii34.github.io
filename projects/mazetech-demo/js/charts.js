// Fake chart data for the demo — no API calls, no backend
document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('chartEnquiries');
  if (!canvas || typeof Chart === 'undefined') return;

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
      datasets: [{
        label: 'Enquiries (demo)',
        data: [78, 92, 110, 88, 120, 142],
        backgroundColor: 'rgba(22,119,255,0.7)',
        borderColor: '#1677ff',
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(23,59,99,0.4)' },
          ticks: { color: '#a9b9cb' }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#a9b9cb' }
        }
      }
    }
  });
});