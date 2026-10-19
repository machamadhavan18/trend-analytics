import React from 'react';
import Plotly from 'plotly.js-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';

const Plot = createPlotlyComponent(Plotly);

export default function PlotlyChart({ data, layout, config, style, className }) {
  const mergedLayout = {
    autosize: true,
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: {
      family: 'Inter, system-ui, -apple-system, sans-serif',
      color: '#94a3b8'
    },
    margin: { t: 36, r: 24, b: 40, l: 48 },
    ...layout
  };

  const mergedConfig = {
    responsive: true,
    displayModeBar: false,
    ...config
  };

  return (
    <div className={`chart-wrapper ${className || ''}`} style={{ width: '100%', height: '100%', minHeight: '300px', ...style }}>
      <Plot
        data={data}
        layout={mergedLayout}
        config={mergedConfig}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
