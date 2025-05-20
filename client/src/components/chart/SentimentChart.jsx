import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function SentimentChart({ sentimentCounts }) {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const chartData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        label: 'Number of Reviews',
        data: [
          sentimentCounts.Positive,
          sentimentCounts.Neutral,
          sentimentCounts.Negative,
        ],
        backgroundColor: [
          'rgba(75, 192, 92, 0.7)',  // Green for positive
          'rgba(201, 203, 207, 0.7)', // Grey for neutral
          'rgba(239, 68, 68, 0.7)',  // Red for negative
        ],
        borderColor: [
          'rgb(75, 192, 92)',
          'rgb(201, 203, 207)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="card h-full">
      <h2 className="text-xl font-semibold mb-4">Sentiment Distribution</h2>
      <div className="h-64">
        <Bar options={chartOptions} data={chartData} />
      </div>
    </div>
  );
}

export default SentimentChart;