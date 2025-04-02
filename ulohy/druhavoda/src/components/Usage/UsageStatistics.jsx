import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const UsageStatistics = ({ data, gauges }) => {
  const prepareChartData = () => {
    return data.map(item => ({
      name: gauges.find(g => g.ID === item.Gauge_ID)?.SerialNumber || `Měřák ${item.Gauge_ID}`,
      Heat: item.Heat,
      ColdWater: item.ColdWater,
      HotWater: item.HotWater
    }));
  };

  return (
    <div className="usage-statistics">
      <h3>Spotřeba za aktuální měsíc</h3>
      <div style={{ height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={prepareChartData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Heat" fill="#8884d8" name="Teplo [PJ]" />
            <Bar dataKey="ColdWater" fill="#82ca9d" name="Studená voda [m³]" />
            <Bar dataKey="HotWater" fill="#ffc658" name="Teplá voda [m³]" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UsageStatistics;
