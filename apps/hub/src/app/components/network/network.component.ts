import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-network',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.css']
})
export class NetworkComponent implements OnInit {
  // Network devices and status
  devices: NetworkDevice[] = [];
  
  // Stats
  stats = {
    totalDevices: 0,
    onlineDevices: 0,
    bandwidth: '0 Mbps',
    latency: '0 ms'
  };

  ngOnInit() {
    this.loadNetworkDevices();
  }

  loadNetworkDevices() {
    // TODO: Integrate with PocketBase or network scanning service
    // Placeholder data
    this.devices = [
      {
        name: 'Router',
        ip: '192.168.1.1',
        mac: '00:11:22:33:44:55',
        status: 'online',
        type: 'router'
      },
      {
        name: 'NAS Server',
        ip: '192.168.1.100',
        mac: '00:11:22:33:44:56',
        status: 'online',
        type: 'server'
      }
    ];

    this.stats.totalDevices = this.devices.length;
    this.stats.onlineDevices = this.devices.filter(d => d.status === 'online').length;
  }

  getDeviceIcon(type: string): string {
    switch(type) {
      case 'router': return 'router';
      case 'server': return 'dns';
      case 'computer': return 'computer';
      case 'mobile': return 'smartphone';
      case 'iot': return 'sensors';
      default: return 'device_unknown';
    }
  }

  refreshDevices() {
    this.loadNetworkDevices();
  }
}

interface NetworkDevice {
  name: string;
  ip: string;
  mac: string;
  status: 'online' | 'offline';
  type: string;
  lastSeen?: Date;
}
