import React from 'react';
import { 
  BookOpen, 
  Cpu, 
  ShieldCheck, 
  Zap 
} from 'lucide-react';

export interface BacklogItem {
  title: string;
  desc: string;
  status?: 'completed' | 'backlog' | 'in-progress';
}

export interface BacklogSection {
  category: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  items: BacklogItem[];
}

export const BACKLOG_DATA: BacklogSection[] = [
  {
    category: "Foundations & Beginners",
    icon: BookOpen,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    items: [
      { title: "Optical Cleaning Simulator", desc: "Step-by-step interactive guide on using One-Click cleaners for MPO and LC end-faces.", status: 'backlog' },
      { title: "Power Level (dBm) Interpreter", desc: "A beginner's guide to reading transceiver DOM metrics: what is 'Good' vs 'Critical' light.", status: 'completed' },
      { title: "The SFP Form Factor Matrix", desc: "Detailed visual breakdown of the SFP family: SFP (1G), SFP+ (10G), SFP28 (25G), SFP56 (50G), and SFP-DD.", status: 'completed' },
      { title: "Fiber Jacket Color Guide", desc: "Quick-reference visual for industry standard colors: OS2 (Yellow), OM3 (Aqua), OM4 (Violet), OM5 (Lime).", status: 'backlog' },
      { title: "Wavelength Spectrum Visualizer", desc: "An interactive slider showing 850nm (MMF), 1310nm (SMF), and the CWDM4 grid bands.", status: 'backlog' },
      { title: "Interactive Connector Gallery", desc: "High-resolution visual reference for distinguishing APC (Green) from UPC (Blue) and MPO-12/16 types.", status: 'backlog' },
      { title: "Fiber Grade Decision Tree", desc: "Simplified questionnaire to help new engineers pick between OM3, OM4, OM5, and OS2 SMF.", status: 'backlog' },
      { title: "Transceiver Anatomy 101", desc: "Exploded 3D view of an OSFP module showing the OSA, PCB, DSP, and thermal heatsink layers.", status: 'completed' }
    ]
  },
  {
    category: "Advanced Engineering Tools",
    icon: Cpu,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    items: [
      { title: "Optical Link Budget Calculator", desc: "Input fiber distance and patch count to predict dB loss based on connector types.", status: 'completed' },
      { title: "MACsec Overhead Analyzer", desc: "Calculate throughput tax and latency penalties for 400G-ZR encrypted links.", status: 'backlog' },
      { title: "AEC/ACC Tuning Guide", desc: "Recommended host SerDes settings for active electrical cables across different NIC vendors.", status: 'backlog' },
      { title: "FEC Performance Visualizer", desc: "Interactive visualization of Pre-FEC vs Post-FEC BER slopes for 400G/800G PAM4 links.", status: 'backlog' },
      { title: "Power Cascade Simulator", desc: "Calculate cumulative power draw and heat dissipation for fully loaded high-density chassis.", status: 'backlog' }
    ]
  },
  {
    category: "Technical Content & Protocols",
    icon: ShieldCheck,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    items: [
      { title: "Multi-Vendor Interop Library", desc: "Validated physical layer paths for OSFP modules connecting to 3rd party SmartNICs.", status: 'backlog' },
      { title: "Failure Mode Library", desc: "High-resolution visual reference for dirty, damaged, or scratched fiber end-faces.", status: 'backlog' },
      { title: "RoCEv2 Tuning Guide", desc: "Optimal PFC/ECN buffer values for high-performance AI fabrics using deep-buffer switches.", status: 'backlog' },
      { title: "ZR+ Channel Planner", desc: "75GHz and 100GHz grid planning for coherent DCI links traversing optical line systems.", status: 'backlog' },
      { title: "Cable Management Optimizer", desc: "Calculate tray fill and bend radius limits for high-density 800G MPO deployments.", status: 'backlog' }
    ]
  },
  {
    category: "Platform & AI Evolution",
    icon: Zap,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    items: [
      { title: "Digital Operations Live Sync", desc: "Direct API integration to pull live transceiver DDM data into the UI canvas.", status: 'backlog' },
      { title: "Signal Eye Simulator", desc: "Interactive eye-diagram generator for SerDes tuning and lane health visualization.", status: 'backlog' },
      { title: "Digital Twin API", desc: "Mirror your lab architecture directly into a virtual management instance for provisioning.", status: 'backlog' },
      { title: "Offline PWA Mode", desc: "Full database functionality for field engineers working in shielded data center rooms.", status: 'backlog' },
      { title: "Telemetry Streaming Overlay", desc: "Real-time gNMI/OpenConfig telemetry visualization for link utilization heatmaps.", status: 'backlog' }
    ]
  }
];