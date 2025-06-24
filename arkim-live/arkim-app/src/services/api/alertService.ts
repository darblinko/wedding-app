import OperationResult from "../../types/api/OperationResult";
import apiClient from "./apiClient";
import { AlertDetails } from "../../types/alerts/AlertDetails";

// Mock data for alerts with different severity levels
const mockAlerts: AlertDetails[] = [
  {
    id: "alert-001",
    title: "Critical Temperature Alert",
    text: "Equipment B7-102 has reached critical temperature of 95°C. Immediate attention required.",
    severity: "error",
    timeUtc: new Date(Date.now() - 1000 * 60 * 20).toISOString(), // 20 minutes ago
    isHandled: false,
    navigationLink: "/equipment/B7-102"
  },
  {
    id: "alert-002",
    title: "Maintenance Due",
    text: "Scheduled maintenance for Pump Station A4 is due in 3 days. Please assign a technician.",
    severity: "warning",
    timeUtc: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    isHandled: false,
    navigationLink: "/maintenance/schedule"
  },
  {
    id: "alert-003",
    title: "System Update Complete",
    text: "Firmware update to version 3.2.1 has been successfully applied to all connected sensors.",
    severity: "success",
    timeUtc: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    isHandled: true,
    handledBy: "John Smith",
    handleTimeUtc: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString() // 23 hours ago
  }
];

// Flag to toggle between mock data and real API calls
const USE_MOCK_DATA = true;

const alertService = {
  countUnhandled: async (): Promise<number> => {
    if (USE_MOCK_DATA) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      // Count unhandled alerts from mock data
      return mockAlerts.filter(alert => !alert.isHandled).length;
    }
    const response = await apiClient.get<number>(`/alerts/unhandled`);
    return response.data;
  },

  list: async (showHandled: boolean): Promise<AlertDetails[]> => {
    if (USE_MOCK_DATA) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      // Return all alerts or only unhandled ones based on showHandled parameter
      return showHandled 
        ? [...mockAlerts] 
        : mockAlerts.filter(alert => !alert.isHandled);
    }
    const response = await apiClient.get<AlertDetails[]>(`/alerts/list?showHandled=${showHandled}`);
    return response.data;
  },

  markHandled: async (alertId: string, isHandled: boolean = true): Promise<OperationResult> => {
    if (USE_MOCK_DATA) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Update the mock data (this works for demonstration but will reset after page refresh)
      const alertIndex = mockAlerts.findIndex(alert => alert.id === alertId);
      if (alertIndex !== -1) {
        mockAlerts[alertIndex] = {
          ...mockAlerts[alertIndex],
          isHandled,
          handledBy: "Current User", // In a real app, this would come from user context
          handleTimeUtc: new Date().toISOString()
        };
      }
      
      return { isSuccess: true, message: "Alert marked as handled successfully" } as OperationResult;
    }
    const response = await apiClient.patch<OperationResult>(`/alerts/mark/handled`, {
      alertId,
      isHandled,
    });
    return response.data;
  },
};

export default alertService;
