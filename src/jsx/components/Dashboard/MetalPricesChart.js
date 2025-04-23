import React, { useEffect, useState } from 'react';
import MetalPricesCandlestickChart from './MetalPricesCandlestickChart';

const MetalPricesChart = ({ data }) => {
  return (
    <div className="card-body">
      <MetalPricesCandlestickChart data={data} />
    </div>
  );
};

export default MetalPricesChart;