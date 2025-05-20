import React, { useState, useEffect } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

/**
 * ReviewTreemap shows product categories by review count
 * @param {Object} props - Component props
 * @param {Array} props.reviews - Review data array
 * @param {String} props.title - Chart title
 */
const ReviewTreemap = ({ reviews, title = "Reviews by Product" }) => {
  const [treeData, setTreeData] = useState([]);
  
  useEffect(() => {
    if (!reviews || reviews.length === 0) {
      setTreeData([]);
      return;
    }
    
    // Group by product and count reviews
    const productGroups = {};
    
    reviews.forEach(review => {
      const productId = review.asin || 'Unknown';
      
      if (!productGroups[productId]) {
        productGroups[productId] = {
          name: productId,
          value: 0,
          totalRating: 0
        };
      }
      
      productGroups[productId].value++;
      productGroups[productId].totalRating += review.overall || 0;
    });
    
    // Calculate average rating
    Object.values(productGroups).forEach(product => {
      product.avgRating = product.value > 0 ? 
        (product.totalRating / product.value).toFixed(1) : 0;
    });
    
    // Convert to array for the chart
    const data = {
      name: 'Products',
      children: Object.values(productGroups)
    };
    
    setTreeData([data]);
  }, [reviews]);
  
  // Custom treemap tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip" style={{ 
          backgroundColor: '#fff', 
          padding: '10px', 
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}>
          <p><strong>Product ID:</strong> {data.name}</p>
          <p><strong>Reviews:</strong> {data.value}</p>
          <p><strong>Avg Rating:</strong> {data.avgRating}</p>
        </div>
      );
    }
    return null;
  };
  
  // Color function based on average rating
  const getColor = (entry) => {
    const rating = parseFloat(entry.avgRating || 0);
    
    if (rating >= 4.5) return '#4CAF50'; // Excellent
    if (rating >= 4.0) return '#8BC34A'; // Great
    if (rating >= 3.5) return '#CDDC39'; // Good
    if (rating >= 3.0) return '#FFEB3B'; // Average
    if (rating >= 2.0) return '#FFC107'; // Below average
    return '#FF5722'; // Poor
  };
  
  if (treeData.length === 0) {
    return (
      <div className="chart-container">
        <h2>{title}</h2>
        <div className="chart-wrapper" style={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Waiting for review data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h2>{title}</h2>
      <div className="chart-wrapper" style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <Treemap
            data={treeData}
            dataKey="value"
            aspectRatio={4/3}
            stroke="#fff"
            fill="#8884d8"
            content={({ root, depth, x, y, width, height, index, payload, colors, rank, name }) => {
              return (
                <g>
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    style={{
                      fill: depth < 2 ? getColor(root.children[index]) : '#fff',
                      stroke: '#fff',
                      strokeWidth: 2 / (depth + 1e-10),
                      strokeOpacity: 1 / (depth + 1e-10),
                    }}
                  />
                  {depth === 1 && width > 50 && height > 20 && (
                    <text
                      x={x + width / 2}
                      y={y + height / 2 + 7}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize={12}
                    >
                      {root.children[index].name}
                    </text>
                  )}
                </g>
              );
            }}
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReviewTreemap;