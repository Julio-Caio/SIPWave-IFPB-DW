document.addEventListener("DOMContentLoaded", () => {
    const ctx = document.getElementById("DoughnutChart").getContext('2d')
    const totalAttendees = 148;

    const doughnutChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ['Attended', 'Pending', 'In Progress'],
        datasets: [
          {
            label: "Total Attendees",
            data: [134, 11, 3],
            backgroundColor: ['#2DD4BF', '#E11D48', '#CA8A04']
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            align: 'start',
          },
          tooltip: {
            enabled: true
          },
        },
        animation: {
          animateRotate: true,
          animateScale: true
        }
      },
      plugins: [{
        beforeDraw: (chart) => {
          const width = chart.width,
                height = chart.height,
                ctx = chart.ctx;
          ctx.restore();
          const fontSize = (height / 114).toFixed(2);
          ctx.font = fontSize + "em Arial";
          ctx.textBaseline = "middle";
          ctx.fontWeight = '800';
          const text = totalAttendees,
                textX = Math.round((width - ctx.measureText(text).width) / 2),
                textY = height / 2.3;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(text, textX, textY);
          ctx.save();
        }
      }]
    })
  });