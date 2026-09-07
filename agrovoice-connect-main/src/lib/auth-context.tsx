import React, { createContext, useContext, useState, useEffect } from "react";
import {
  auth,
  loginWithGooglePopup,
  loginWithEmailPass,
  registerWithEmailPass,
  loginAsGuest,
  logoutUser,
  setupRecaptcha,
  requestPhoneOtp,
  saveShipment,
  updateShipment,
  saveRoute,
  updateRoute,
  subscribeShipments,
  subscribeRoutes,
  onAuthStateChanged,
  ConfirmationResult,
} from "./firebase";

export type UserRole = "farmer" | "driver" | "admin" | null;

export interface UserProfile {
  id: string;
  role: UserRole;
  name: string;
  phone?: string;
  email?: string;
  driverId?: string;
  isVerified?: boolean;
}

export interface Shipment {
  id: string;
  cropType: string;
  quantityKg: number;
  pickupLocation: string;
  destinationMandi: string;
  preferredDate: string;
  status: "pending" | "matched" | "in_transit" | "delivered";
  farmerName: string;
  farmerPhone: string;
  driverName?: string;
  driverPhone?: string;
  driverId?: string;
  estimatedFare: number;
  createdAt: string;
}

export interface DriverRoute {
  id: string;
  driverName: string;
  driverPhone: string;
  driverId: string;
  vehicleNumber?: string;
  vehicleType?: string;
  vehicleCapacityKg: number;
  availableCapacityKg: number;
  totalCapacityQuintals: number;
  availableCapacityQuintals: number;
  originLocation: string;
  destinationMandi: string;
  departureTime: string;
  status: "scheduled" | "in_transit" | "completed";
}

interface AuthContextType {
  user: UserProfile | null;
  loginWithGoogle: (role: UserRole) => Promise<{ success: boolean; message?: string }>;
  loginWithEmail: (email: string, pass: string, role: UserRole) => Promise<{ success: boolean; message?: string }>;
  signUpWithEmail: (email: string, pass: string, role: UserRole, name?: string) => Promise<{ success: boolean; message?: string }>;
  sendPhoneOtp: (phone: string, containerId?: string) => Promise<{ success: boolean; message?: string }>;
  verifyPhoneOtp: (otp: string, role: UserRole) => Promise<{ success: boolean; message?: string }>;
  loginDemo: (role: UserRole) => void;
  loginAs: (role: UserRole, name?: string) => void;
  logout: () => void;
  shipments: Shipment[];
  addShipment: (shipment: Omit<Shipment, "id" | "createdAt" | "status">) => Promise<Shipment>;
  updateShipmentStatus: (id: string, status: Shipment["status"], driverDetails?: Partial<Shipment>) => void;
  driverRoutes: DriverRoute[];
  addDriverRoute: (route: any) => void;
  updateDriverRouteStatus: (id: string, status: DriverRoute["status"]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("agro_user");
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [driverRoutes, setDriverRoutes] = useState<DriverRoute[]>([
    {
      id: "rt_1",
      driverName: "Gurpreet Singh",
      driverPhone: "+91 98123 45678",
      driverId: "DRV-8821",
      vehicleNumber: "UP 80 AT 4921",
      vehicleType: "Eicher 10.90 Truck",
      vehicleCapacityKg: 8000,
      availableCapacityKg: 4000,
      totalCapacityQuintals: 100,
      availableCapacityQuintals: 50,
      originLocation: "Aligarh Hub",
      destinationMandi: "Agra Central Mandi",
      departureTime: "Tomorrow, 6:00 AM",
      status: "scheduled",
    },
  ]);

  // Sync auth & persistence
  useEffect(() => {
    if (user) localStorage.setItem("agro_user", JSON.stringify(user));
    else localStorage.removeItem("agro_user");
  }, [user]);

  useEffect(() => {
    const unsubShipments = subscribeShipments((items) => {
      if (items.length > 0) setShipments(items as Shipment[]);
    });
    const unsubRoutes = subscribeRoutes((items) => {
      if (items.length > 0) setDriverRoutes(items as DriverRoute[]);
    });
    return () => {
      unsubShipments();
      unsubRoutes();
    };
  }, []);

  // 1. Google Login
  const loginWithGoogle = async (role: UserRole) => {
    try {
      const res = await loginWithGooglePopup();
      const profile: UserProfile = {
        id: res.user.uid,
        role,
        name: res.user.displayName || "Google User",
        email: res.user.email || undefined,
        phone: res.user.phoneNumber || undefined,
        isVerified: true,
      };
      setUser(profile);
      return { success: true };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  };

  // 2. Email Login
  const loginWithEmail = async (email: string, pass: string, role: UserRole) => {
    try {
      const res = await loginWithEmailPass(email, pass);
      const profile: UserProfile = {
        id: res.user.uid,
        role,
        name: res.user.displayName || email.split("@")[0],
        email: res.user.email || email,
        isVerified: true,
      };
      setUser(profile);
      return { success: true };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  };

  // 3. Email Sign Up
  const signUpWithEmail = async (email: string, pass: string, role: UserRole, name?: string) => {
    try {
      const res = await registerWithEmailPass(email, pass);
      const profile: UserProfile = {
        id: res.user.uid,
        role,
        name: name || email.split("@")[0],
        email: res.user.email || email,
        isVerified: true,
      };
      setUser(profile);
      return { success: true };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  };

  // 4. Phone SMS OTP
  const sendPhoneOtp = async (phone: string, containerId = "recaptcha-container") => {
    try {
      const verifier = setupRecaptcha(containerId);
      if (!verifier) return { success: false, message: "Recaptcha not ready" };
      const confirmation = await requestPhoneOtp(`+91${phone.slice(-10)}`, verifier);
      setConfirmationResult(confirmation);
      return { success: true };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  };

  const verifyPhoneOtp = async (otp: string, role: UserRole) => {
    try {
      if (!confirmationResult) throw new Error("No active OTP request");
      const res = await confirmationResult.confirm(otp);
      const profile: UserProfile = {
        id: res.user.uid,
        role,
        name: role === "farmer" ? "Kisan User" : "Driver User",
        phone: res.user.phoneNumber || undefined,
        isVerified: true,
      };
      setUser(profile);
      return { success: true };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  };

  // 5. Demo / Instant Login
  const loginDemo = (role: UserRole) => {
    loginAsGuest().catch(() => {});
    const profile: UserProfile = {
      id: `demo_${Date.now()}`,
      role,
      name: role === "farmer" ? "Ramesh Patel (Farmer Demo)" : role === "driver" ? "Vikram Singh (Driver Demo)" : "Administrator (Demo)",
      isVerified: true,
    };
    setUser(profile);
  };

  const loginAs = (role: UserRole, name?: string) => {
    setUser({
      id: `usr_${Date.now()}`,
      role,
      name: name || (role === "farmer" ? "Ramesh Patel" : role === "driver" ? "Vikram Singh" : "Admin"),
      isVerified: true,
    });
  };

  const logout = () => {
    logoutUser().catch(() => {});
    setUser(null);
    localStorage.removeItem("agro_user");
  };

  // 6. Shipments & Routes
  const addShipment = async (shipmentData: any): Promise<Shipment> => {
    const crop = shipmentData.cropType || shipmentData.produceType || "Produce";
    const fare = shipmentData.estimatedFare || shipmentData.estimatedCost || Math.round((shipmentData.quantityKg || 1000) * 0.4);

    const item: Shipment = {
      id: `shp_${Date.now()}`,
      cropType: crop,
      quantityKg: Number(shipmentData.quantityKg) || 1000,
      pickupLocation: shipmentData.pickupLocation || "Farm Pickup",
      destinationMandi: shipmentData.destinationMandi || "Central Mandi",
      preferredDate: shipmentData.preferredDate || new Date().toISOString().split("T")[0],
      farmerName: shipmentData.farmerName || user?.name || "Farmer",
      farmerPhone: shipmentData.farmerPhone || user?.phone || "+91 98765 43210",
      estimatedFare: fare,
      status: "pending",
      createdAt: new Date().toISOString(),
      ...(shipmentData.driverName ? { driverName: shipmentData.driverName } : {}),
      ...(shipmentData.driverPhone ? { driverPhone: shipmentData.driverPhone } : {}),
      ...(shipmentData.driverId ? { driverId: shipmentData.driverId } : {}),
    };

    setShipments((prev) => [item, ...prev]);

    try {
      await saveShipment(item);
      console.log("Order saved to Firebase Firestore successfully:", item);
    } catch (err) {
      console.error("Failed to save order to Firebase Firestore:", err);
    }

    return item;
  };

  const updateShipmentStatus = (id: string, status: Shipment["status"], driverDetails?: Partial<Shipment>) => {
    setShipments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status, ...driverDetails } : s))
    );
    updateShipment(id, { status, ...driverDetails }).catch(() => {});
  };

  const addDriverRoute = (routeData: any) => {
    const totalKg = routeData.vehicleCapacityKg || routeData.totalCapacityKg || 8000;
    const item: DriverRoute = {
      ...routeData,
      id: `rt_${Date.now()}`,
      vehicleCapacityKg: totalKg,
      availableCapacityKg: totalKg,
      totalCapacityQuintals: Math.round(totalKg / 100),
      availableCapacityQuintals: Math.round(totalKg / 100),
      originLocation: routeData.origin || routeData.originLocation || "Local Mandi",
      status: "scheduled",
    };
    setDriverRoutes((prev) => [item, ...prev]);
    saveRoute(item).catch(() => {});
  };

  const updateDriverRouteStatus = (id: string, status: DriverRoute["status"]) => {
    setDriverRoutes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    updateRoute(id, { status }).catch(() => {});
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loginWithGoogle,
        loginWithEmail,
        signUpWithEmail,
        sendPhoneOtp,
        verifyPhoneOtp,
        loginDemo,
        loginAs,
        logout,
        shipments,
        addShipment,
        updateShipmentStatus,
        driverRoutes,
        addDriverRoute,
        updateDriverRouteStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
