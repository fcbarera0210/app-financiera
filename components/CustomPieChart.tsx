import React from 'react';
import { View } from 'react-native';
import { G, Path, Svg } from 'react-native-svg';

interface Slice {
  value: number;
  color: string;
}

interface CustomPieChartProps {
  data: Slice[];
  size: number;
  strokeWidth?: number;
  onSlicePress?: (index: number) => void;
  selectedSliceIndex?: number | null;
}

const CustomPieChart: React.FC<CustomPieChartProps> = ({ 
    data, 
    size, 
    strokeWidth = 20, // Aumentamos el grosor por defecto
    onSlicePress,
    selectedSliceIndex
}) => {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;

  const total = data.reduce((sum, slice) => sum + slice.value, 0);
  let startAngle = 0;

  const getCoordinatesForPercent = (percent: number) => {
    const x = center + radius * Math.cos(2 * Math.PI * percent);
    const y = center + radius * Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  if (total === 0) {
    return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
            <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
                <Path
                    d={`M ${center} ${strokeWidth / 2} A ${radius} ${radius} 0 1 1 ${center - 0.01} ${strokeWidth / 2}`}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth={strokeWidth}
                />
            </Svg>
        </View>
    );
  }

  return (
    <View style={{ width: size, height: size }}>
      <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: [{ rotate: '-90deg' }] }}>
        {data.map((slice, index) => {
          const percentage = slice.value / total;
          const [startX, startY] = getCoordinatesForPercent(startAngle);
          const endAngle = startAngle + percentage;
          const [endX, endY] = getCoordinatesForPercent(endAngle);

          const largeArcFlag = percentage > 0.5 ? 1 : 0;

          const pathData = [
            `M ${startX} ${startY}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`
          ].join(' ');

          startAngle = endAngle;

          // --- LÓGICA DE RESALTADO ---
          // Si hay un slice seleccionado y no es este, se pone gris.
          const strokeColor = selectedSliceIndex !== null && selectedSliceIndex !== index 
            ? '#d1d5db' // Color gris para los no seleccionados
            : slice.color; // Color original para el seleccionado o todos

          return (
            <G key={index} onPress={() => onSlicePress && onSlicePress(index)}>
                <Path
                    d={pathData}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                />
            </G>
          );
        })}
      </Svg>
    </View>
  );
};

export default CustomPieChart;
