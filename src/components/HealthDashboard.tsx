import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, Thermometer, Brain, TrendingUp, TrendingDown } from 'lucide-react';

interface VitalCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  trend: number;
  color: string;
  status?: 'normal' | 'warning' | 'critical';
}

interface HealthDashboardProps {
  assessmentResults?: {
    heartRate?: number;
    bloodPressure?: { systolic: number; diastolic: number };
    temperature?: number;
    stressLevel?: 'Low' | 'Moderate' | 'High' | 'Very High';
  };
}

const VitalCard: React.FC<VitalCardProps> = ({ icon: Icon, title, value, trend, color, status = 'normal' }) => {
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const getStatusColor = () => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-700';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return `${color.replace('border-', 'bg-').replace('-600', '-100')} ${color.replace('border-', 'text-')}`;
    }
  };

  return (
    <motion.div
      variants={variants}
      className={`bg-white p-6 rounded-xl shadow-md border-l-4 ${color}`}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${getStatusColor()}`}>
          <Icon className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <h3 className="text-gray-500 text-sm">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
          <div className="flex items-center gap-1">
            {trend >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {Math.abs(trend)}%
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const HealthDashboard: React.FC<HealthDashboardProps> = ({ assessmentResults }) => {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const getHeartRateStatus = (rate?: number) => {
    if (!rate) return 'normal';
    if (rate < 60 || rate > 100) return 'critical';
    if (rate < 65 || rate > 95) return 'warning';
    return 'normal';
  };

  const getBloodPressureStatus = (bp?: { systolic: number; diastolic: number }) => {
    if (!bp) return 'normal';
    if (bp.systolic > 140 || bp.diastolic > 90) return 'critical';
    if (bp.systolic > 130 || bp.diastolic > 85) return 'warning';
    return 'normal';
  };

  const getTemperatureStatus = (temp?: number) => {
    if (!temp) return 'normal';
    if (temp > 100.4 || temp < 97) return 'critical';
    if (temp > 99.5 || temp < 97.5) return 'warning';
    return 'normal';
  };

  const getStressStatus = (level?: string) => {
    if (!level) return 'normal';
    if (level === 'Very High') return 'critical';
    if (level === 'High') return 'warning';
    return 'normal';
  };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      <VitalCard
        icon={Heart}
        title="Heart Rate"
        value={assessmentResults?.heartRate ? `${assessmentResults.heartRate} bpm` : "72 bpm"}
        trend={2.5}
        color="border-red-600"
        status={getHeartRateStatus(assessmentResults?.heartRate)}
      />
      <VitalCard
        icon={Activity}
        title="Blood Pressure"
        value={assessmentResults?.bloodPressure 
          ? `${assessmentResults.bloodPressure.systolic}/${assessmentResults.bloodPressure.diastolic}`
          : "120/80"}
        trend={-1.2}
        color="border-blue-600"
        status={getBloodPressureStatus(assessmentResults?.bloodPressure)}
      />
      <VitalCard
        icon={Thermometer}
        title="Temperature"
        value={assessmentResults?.temperature ? `${assessmentResults.temperature}°F` : "98.6°F"}
        trend={0.5}
        color="border-yellow-600"
        status={getTemperatureStatus(assessmentResults?.temperature)}
      />
      <VitalCard
        icon={Brain}
        title="Stress Level"
        value={assessmentResults?.stressLevel || "Low"}
        trend={-5.0}
        color="border-purple-600"
        status={getStressStatus(assessmentResults?.stressLevel)}
      />
    </motion.div>
  );
};