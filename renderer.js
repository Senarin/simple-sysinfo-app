const { shell, app } = require("electron");
const { execFile } = require("child_process");
const os = require("os");
const dns = require("dns");
const si = require("systeminformation");

const byteCalc = {
 convertBytes : function(b){
  if(b >= 0 && b < 1024){return `${b} 바이트`;}
  else if(b >= 1024 && b < Math.pow(1024,2)){return `${Math.floor((b / 1024) * 10)/10} KiB`;}
  else if(b >= Math.pow(1024,2) && b < Math.pow(1024,3)){return `${Math.floor((b / Math.pow(1024,2)) * 100)/100} MiB`;}
  else if(b >= Math.pow(1024,3) && b < Math.pow(1024,4)){return `${Math.floor((b / Math.pow(1024,3)) * 1000)/1000} GiB`;}
  else if(b >= Math.pow(1024,4) && b < Math.pow(1024,5)){return `${Math.floor((b / Math.pow(1024,4)) * 1000)/1000} TiB`;}
  else if(b >= Math.pow(1024,5) && b < Math.pow(1024,6)){return `${Math.floor((b / Math.pow(1024,5)) * 1000)/1000} PiB`;}
 },
 convertBytesDec : function(b){
  if(b >= 0 && b < 1000){return `${b} 바이트`;}
  else if(b >= 1000 && b < Math.pow(1000,2)){return `${Math.floor((b / 1000) * 10)/10}KB`;}
  else if(b >= Math.pow(1000,2) && b < Math.pow(1000,3)){return `${Math.floor((b / Math.pow(1000,2)) * 100)/100}MB`;}
  else if(b >= Math.pow(1000,3) && b < Math.pow(1000,4)){return `${Math.floor((b / Math.pow(1000,3)) * 1000)/1000}GB`;}
  else if(b >= Math.pow(1000,4) && b < Math.pow(1000,5)){return `${Math.floor((b / Math.pow(1000,4)) * 1000)/1000}TB`;}
  else if(b >= Math.pow(1000,5) && b < Math.pow(1000,6)){return `${Math.floor((b / Math.pow(1000,5)) * 1000)/1000}PB`;}
 }
};

function openSystemSettings(){
 let sysPlatform = os.platform();
 switch(sysPlatform.toLowerCase()){
  // 윈도우 환경
  case "win32": shell.openExternal("ms-settings:"); break;
  // MacOS 환경
  case "darwin": shell.openExternal("x-apple.systempreferences:com.apple.preference.general",{activate: true}); break;
  case "linux": // 리눅스의 경우, 데스크탑 환경에 따라 다르게 처리
   switch(process.env.XDG_CURRENT_DESKTOP.toLowerCase()){
    case "gnome": shell.openPath("gnome-control-center"); break;
    case "kde": shell.openPath("systemsettings5"); break;
    case "xfce": shell.openPath("xfce4-settings-manager"); break;
    case "mate": shell.openPath("mate-control-center"); break;
    case "cinnamon": shell.openPath("cinnamon-settings"); break;
    default: alert("해당 기능을 지원하지 않는 데스크탑 환경입니다. 시스템 설정을 열 수 없습니다."); break;
   }
  break;
  default: alert("해당 기능을 지원하지 않는 운영체제입니다. 시스템 설정을 열 수 없습니다."); break;
 }

}

function aboutApp(){
  alert([
  `System Information by Bombyeol (https://bombyeol.me/)`,
  `- 내장 Chromium 버전: ${process.versions.chrome}`,
  `- Node.js 런타임 버전: ${process.versions.node}`,
  `- Electron 버전: ${process.versions.electron}`
  ].join("\n"));
}

function getSysinfo(){
  return {
    canonicalname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    cpu: os.cpus(),
    memory: os.totalmem(),
    uptime: os.uptime(),
    sysver: os.release(),
  };
}

function loadSysInfo(){
  
  const sysinfo = getSysinfo();
  console.log(`시스템 정보를 불러옵니다... (${new Date().toLocaleString()}) `);
  si.system().then(data => {
   document.getElementById("device-canonical-name").innerHTML = sysinfo.canonicalname;
   document.getElementById("device-vendor").innerHTML = data.manufacturer;
   document.getElementById("device-model").innerHTML = data.model;
  }).then(si.chassis().then(data => {
   document.getElementById("device-formfactor").innerHTML = data.type;
  })).then(si.cpu().then(data => {
   // CPU 정보 불러오기
   document.getElementById("loading-progress").innerHTML = "CPU 정보 불러오는 중...";
   
   document.getElementById("processor-vendor").innerHTML = data.vendor;
   document.getElementById("processor-info").innerHTML = sysinfo.cpu[0].model;
   document.getElementById("processor-physical-cores").innerHTML = data.physicalCores;
   document.getElementById("processor-threads").innerHTML = sysinfo.cpu.length;
   document.getElementById("processor-arch").innerHTML = sysinfo.arch;
   document.getElementById("processor-socket").innerHTML = data.socket;
   document.getElementById("processor-clockspeed").innerHTML = `${data.speed}GHz`;
  })).then(si.osInfo().then(data => {
   // 운영체제 정보 불러오기
   document.getElementById("loading-progress").innerHTML = "OS 정보 불러오는 중...";
   document.getElementById("os-platform").innerHTML = `${data.platform} (${sysinfo.platform})`;
   document.getElementById("os-distro").innerHTML = `${data.distro} ${data.release} (빌드 ${data.build})`;
   document.getElementById("system-version").innerHTML = data.kernel;
   document.getElementById("system-uefi").innerHTML = (data.uefi) ? "예" : "아니오";
  })).then(si.mem().then(data => {
   // 메모리 전반 정보 불러오기
   document.getElementById("loading-progress").innerHTML = "메모리 정보 불러오는 중...";
   document.getElementById("memory-total").innerHTML = `${byteCalc.convertBytes(data.total)} (${data.total} 바이트)`;
   document.getElementById("memory-swap-size").innerHTML = `${byteCalc.convertBytes(data.swaptotal)} (${data.swaptotal} 바이트)`;
  })).then(si.memLayout().then(data => {
   // 물리 메모리 모듈 정보 불러오기
   let moduleSize = [];
   for(let i=0;i<data.length;i++){moduleSize[i] = data[i].size;}
   document.getElementById("memory-size").innerHTML = `${byteCalc.convertBytes(moduleSize.reduce((a,b) => a+b,0))} (${moduleSize.reduce((a,b) => a+b,0)} 바이트)`;
   document.getElementById("memory-modules").innerHTML = `${data.length}개`;
   document.getElementById("memory-type").innerHTML = `${data[0].type} ${data[0].formFactor} ${(data[0].ecc) ? "ECC" : "Non-ECC"} (동작 속도 ${data[0].clockSpeed} MT/s)`;
  })).then(si.graphics().then(data => {
   // 그래픽 어댑터(VGA) 정보 불러오기
   document.getElementById("loading-progress").innerHTML = "그래픽 정보 불러오는 중...";
 
   let gpuListOutput = document.getElementById("gpu-list");
    
   for(let i=0;i<data.controllers.length;i++){
    let gpuItemHead = document.createElement("li");
    let gpuInfoOutput = document.createElement("ul");
    gpuItemHead.id = `gpu-item-${i}`;
    gpuItemHead.appendChild(document.createTextNode(`GPU #${i}`));

    let gpuControllerName = data.controllers[i].model, gpuControllerVendor = data.controllers[i].vendor;
    let gpuModuleVendor = data.controllers[i].subVendor, gpuBusType = data.controllers[i].bus;
    let gpuMemorySize = `${byteCalc.convertBytes(data.controllers[i].vram * Math.pow(1024,2))} (${(data.controllers[i].vram * Math.pow(1024,2))} 바이트)`;

    let gpuNameOutput = document.createElement("li");
    let gpuVendorOutput = document.createElement("li");
    let gpuModuleVendorOutput = document.createElement("li");
    let gpuBusTypeOutput = document.createElement("li");
    let gpuMemoryOutput = document.createElement("li");
    
    gpuNameOutput.innerHTML = `GPU 장치명 : ${gpuControllerName}`;
    gpuVendorOutput.innerHTML = `GPU 공급업체 : ${gpuControllerVendor}`;

    gpuInfoOutput.appendChild(gpuNameOutput);
    gpuInfoOutput.appendChild(gpuVendorOutput);
    if(typeof gpuModuleVendor != "undefined" && gpuModuleVendor.length > 0){
      gpuModuleVendorOutput.innerHTML = `GPU 모듈 공급업체 : ${gpuModuleVendor}`;
      gpuInfoOutput.appendChild(gpuModuleVendorOutput);
    }
    if(typeof gpuBusType != "undefined" && gpuBusType.length > 0){
      gpuBusTypeOutput.innerHTML = `GPU 버스 종류 : ${gpuBusType}`;
      gpuInfoOutput.appendChild(gpuBusTypeOutput);
    }
    if(typeof data.controllers[i].vram != "undefined" && data.controllers[i].vram > 0){
      gpuMemoryOutput.innerHTML = `전용 GPU 메모리(VRAM) 크기 : ${gpuMemorySize}`;
      gpuInfoOutput.appendChild(gpuMemoryOutput);
    }

    gpuItemHead.appendChild(gpuInfoOutput);
    gpuListOutput.appendChild(gpuItemHead);
   }

   let displayListOutput = document.getElementById("display-list");

   for(let j=0;j<data.displays.length;j++){
    // 디스플레이(모니터) 정보 불러오기
    let displayItemHead = document.createElement("li");
    let displayInfoOutput = document.createElement("ul");
    displayItemHead.id = `display-item-${j}`;
    displayItemHead.appendChild(document.createTextNode(`디스플레이 #${j}`));


    let displayName = data.displays[j].model;
    let displayResolution = `${data.displays[j].resolutionX}x${data.displays[j].resolutionY}`;
    let displayVendor = data.displays[j].vendor;
    let displayRefreshRate = data.displays[j].currentRefreshRate;
    let displayConnectionType = data.displays[j].connection;
    let displayColorDepth = data.displays[j].pixelDepth;

    let displaySizeX = data.displays[j].sizeX;
    let displaySizeY = data.displays[j].sizeY;

    let displaySizeInchesX = displaySizeX / 2.54;
    let displaySizeInchesY = displaySizeY / 2.54;
    let displaySizeInches = Math.sqrt(Math.pow(displaySizeX,2)+Math.pow(displaySizeY,2)) / 2.54;

    let displayNameOutput = document.createElement("li");
    let displayResolutionOutput = document.createElement("li");
    let displayVendorOutput = document.createElement("li");
    let displayRefreshRateOutput = document.createElement("li");
    let displayColorDepthOutput = document.createElement("li");
    let displaySizeOutput = document.createElement("li");
    
    displayNameOutput.innerHTML = `디스플레이 이름 : ${displayName} (${displayConnectionType})`;
    displayResolutionOutput.innerHTML = `기본 디스플레이 해상도 : ${displayResolution}`;
    displayRefreshRateOutput.innerHTML = `디스플레이 주사율(새로고침 빈도) : ${displayRefreshRate}Hz`;
    displaySizeOutput.innerHTML = `디스플레이 크기 : ${displaySizeX}cm x ${displaySizeY}cm (${Math.floor(displaySizeInchesX * 100) / 100}" x ${Math.floor(displaySizeInchesY * 100) / 100}", ${Math.floor(displaySizeInches * 100) / 100}")`;
    displayColorDepthOutput.innerHTML = `디스플레이 색상 : 픽셀당 ${displayColorDepth}비트`;

    displayInfoOutput.appendChild(displayNameOutput);

    if(typeof displayVendor != "undefined" && displayVendor.length > 0){
      displayVendorOutput.innerHTML = `디스플레이 공급업체 : ${displayVendor}`;
      displayInfoOutput.appendChild(displayVendorOutput);
    }else{
      displayVendorOutput.innerHTML = `디스플레이 공급업체 : (알 수 없음)`;
      displayInfoOutput.appendChild(displayVendorOutput);
    }

    displayInfoOutput.appendChild(displayResolutionOutput);
    displayInfoOutput.appendChild(displaySizeOutput);
    displayInfoOutput.appendChild(displayColorDepthOutput);
    displayInfoOutput.appendChild(displayRefreshRateOutput);

    displayItemHead.appendChild(displayInfoOutput);
    displayListOutput.appendChild(displayItemHead);
   }

  })).then(si.diskLayout().then(data => {
   // 저장장치 정보 불러오기
   document.getElementById("loading-progress").innerHTML = "저장장치 정보 불러오는 중...";
 
   for(let d=0;d<data.length;d++){
    let diskItemHead = document.createElement("li");
    let diskInfoOutput = document.createElement("ul");
    diskItemHead.id = `disk-item-${d}`;
    diskItemHead.appendChild(document.createTextNode(`디스크 #${d}`));

    let diskName = data[d].name;
    let diskType = data[d].type;
    let diskSize = `${byteCalc.convertBytesDec(data[d].size)} (${byteCalc.convertBytes(data[d].size)}, ${data[d].size} 바이트)`;
    let diskVendor = data[d].vendor;
    let diskInterface = data[d].interfaceType;
    let diskFirmwareRev = data[d].firmwareRevision;
    let diskSerialNo = data[d].serialNum;

    let diskNameOutput = document.createElement("li");
    let diskTypeOutput = document.createElement("li");
    let diskSizeOutput = document.createElement("li");
    let diskVendorOutput = document.createElement("li");
    let diskInterfaceOutput = document.createElement("li");
    let diskFirmwareRevOutput = document.createElement("li");
    let diskSerialNoOutput = document.createElement("li");

    diskNameOutput.innerHTML = `저장장치 모델명 : ${diskName}`;
    diskTypeOutput.innerHTML = `저장장치 종류 : ${diskType}`;
    diskInterfaceOutput.innerHTML = `저장장치 인터페이스 : ${diskInterface}`;
    diskSizeOutput.innerHTML = `저장 용량 : ${diskSize}`;
    diskFirmwareRevOutput.innerHTML = `펌웨어 버전 : ${diskFirmwareRev}`;

    // 윈도우 환경에서 NVMe SSD의 실제 일련번호 가져오기. 일부 윈도우 버전에서 NVMe SSD의 일련번호가 올바르게 출력되지 않는 경우(해당 장치의 EUI-64/NGUID 값이 대신 출력)가 있어 PowerShell을 통해 가져옴.
    // 참고 URL: https://www.dell.com/support/kbdoc/en-us/000218659/windows-reported-serial-number-does-not-match-serial-number-printed-on-nvme-drive
    if(sysinfo.platform == "win32" && diskInterface.toLowerCase() == "nvme"){
      execFile("powershell.exe",["-Command",`Get-PhysicalDisk -SerialNumber '${diskSerialNo}' | Select -Property AdapterSerialNumber`],(err,stdout,stderr) => {
       diskSerialNoOutput.innerHTML = `일련번호 : ${stdout.trim().split("\r\n")[2].split(/\s/g)[0]}`;
      });
    }else{diskSerialNoOutput.innerHTML = `일련번호 : ${diskSerialNo}`;}


    if(typeof diskVendor != "undefined" && diskVendor.length > 0){
      diskVendorOutput.innerHTML = `공급업체 : ${diskVendor}`;
      diskInfoOutput.appendChild(diskVendorOutput);
    }else{
      diskVendorOutput.innerHTML = `공급업체 : (알 수 없음)`;
      diskInfoOutput.appendChild(diskVendorOutput);
    }

    diskInfoOutput.appendChild(diskNameOutput);
    diskInfoOutput.appendChild(diskTypeOutput);
    diskInfoOutput.appendChild(diskInterfaceOutput);
    diskInfoOutput.appendChild(diskSizeOutput);
    diskInfoOutput.appendChild(diskFirmwareRevOutput);
    diskInfoOutput.appendChild(diskSerialNoOutput);

    diskItemHead.appendChild(diskInfoOutput);
    document.getElementById("storage-list").appendChild(diskItemHead);

   }
  

  })).then(si.audio().then(data => {
   // 사운드(오디오) 장치 정보 불러오기
   document.getElementById("loading-progress").innerHTML = "오디오 정보 불러오는 중...";

   for(let i=0;i<data.length;i++){
    let audioItemHead = document.createElement("li");
    let audioInfoOutput = document.createElement("ul");
    audioItemHead.id = `audio-item-${i}`;
    audioItemHead.appendChild(document.createTextNode(`오디오 장치 #${i}`));

    let audioInternalDevID = data[i].id;
    let audioName = data[i].name;
    let audioType = data[i].type;
    let audioVendor = data[i].manufacturer;

    let audioInternalDevIDOutput = document.createElement("li");

    let audioNameOutput = document.createElement("li");
    let audioTypeOutput = document.createElement("li");
    let audioVendorOutput = document.createElement("li");

    audioInternalDevIDOutput.innerHTML = `오디오 장치 내부 ID : ${audioInternalDevID}`;
    audioNameOutput.innerHTML = `오디오 장치 이름 : ${audioName}`;
    audioVendorOutput.innerHTML = `오디오 장치 공급업체 : ${audioVendor}`;

    if(typeof audioType != "undefined" && audioType.length > 0){
     audioTypeOutput.innerHTML = `오디오 장치 종류 : ${audioType}`;
     audioInfoOutput.appendChild(audioTypeOutput);
    }else{
     audioTypeOutput.innerHTML = `오디오 장치 종류 : (알 수 없음)`;
     audioInfoOutput.appendChild(audioTypeOutput);
    }

    audioInfoOutput.appendChild(audioInternalDevIDOutput);
    audioInfoOutput.appendChild(audioNameOutput);
    audioInfoOutput.appendChild(audioVendorOutput);
    audioItemHead.appendChild(audioInfoOutput);
    document.getElementById("audio-list").appendChild(audioItemHead);
   }

  })).then(si.networkInterfaces().then(data => {
   // 네트워크 장치 정보 불러오기
   document.getElementById("loading-progress").innerHTML = "네트워크 정보 불러오는 중...";

   for(let i=0;i<data.length;i++){
    let networkItemHead = document.createElement("li");
    let networkInfoOutput = document.createElement("ul");
    networkItemHead.id = `network-item-${i}`;
    networkItemHead.appendChild(document.createTextNode(`네트워크 인터페이스 #${i}`));

    let networkIfaceName = data[i].iface, networkCanonicalName = data[i].ifaceName;
    let networkIsDefaultInterface = data[i].default;
    let networkIP4Address = data[i].ip4, networkIP4Subnet = data[i].ip4subnet;
    let networkIP6Address = data[i].ip6, networkIP6Subnet = data[i].ip6subnet;
    let networkMacAddress = data[i].mac, networkType = data[i].type, networkIsDhcp = data[i].dhcp;
    let networkDNSSuffix = data[i].dnsSuffix;

    let networkIfaceNameOutput = document.createElement("li");
    let networkCanonicalNameOutput = document.createElement("li");
    let networkIsDefaultInterfaceOutput = document.createElement("li");
    let networkIP4AddressOutput = document.createElement("li");
    let networkIP4SubnetOutput = document.createElement("li");
    let networkIP6AddressOutput = document.createElement("li");
    let networkIP6SubnetOutput = document.createElement("li");
    let networkMacAddressOutput = document.createElement("li");
    let networkTypeOutput = document.createElement("li");
    let networkIsDhcpOutput = document.createElement("li");
    let networkDNSSuffixOutput = document.createElement("li");


    networkIfaceNameOutput.innerHTML = `인터페이스 이름 : ${networkIfaceName}`;
    networkCanonicalNameOutput.innerHTML = `인터페이스 장치 이름 : ${networkCanonicalName}`;
    networkTypeOutput.innerHTML = `인터페이스 종류 : ${(networkType == "wired") ? "유선" : (((networkType == "wireless") ? "무선" : "(알 수 없음)"))}`;
    networkIsDefaultInterfaceOutput.innerHTML = `기본 인터페이스 여부 : ${networkIsDefaultInterface ? "예" : "아니오"}`;
    networkIP4AddressOutput.innerHTML = `IPv4 주소 : ${(networkIP4Address.length > 0) ? networkIP4Address : "(할당되지 않음)"}`;
    networkIP4SubnetOutput.innerHTML= `IPv4 서브넷 : ${(networkIP4Subnet.length > 0) ? networkIP4Subnet : "(할당되지 않음)"}`;
    networkIP6AddressOutput.innerHTML = `IPv6 주소 : ${(networkIP6Address.length > 0) ? networkIP6Address : "(할당되지 않음)"}`;
    networkIP6SubnetOutput.innerHTML = `IPv6 접두사 : ${(networkIP6Subnet.length > 0) ? networkIP6Subnet : "(할당되지 않음)"}`;
    if(networkIsDefaultInterface === true){
     si.networkGatewayDefault().then(gdata => {
      let networkDefaultGatewayOutput = document.createElement("li");
      networkDefaultGatewayOutput.innerHTML = `기본 게이트웨이: ${gdata}`;
      networkInfoOutput.appendChild(networkDefaultGatewayOutput);
     });
    }
    networkMacAddressOutput.innerHTML = `MAC 주소 : ${networkMacAddress}`;
    networkIsDhcpOutput.innerHTML = `DHCP 사용 여부 : ${networkIsDhcp ? "예" : "아니오"}`;
    networkDNSSuffixOutput.innerHTML = `DNS 접미사 : ${(networkDNSSuffix.length > 0) ? networkDNSSuffix : "(할당되지 않음)"}`;

    networkInfoOutput.appendChild(networkIfaceNameOutput);
    networkInfoOutput.appendChild(networkCanonicalNameOutput);
    networkInfoOutput.appendChild(networkTypeOutput);
    networkInfoOutput.appendChild(networkIsDefaultInterfaceOutput);
    networkInfoOutput.appendChild(networkIP4AddressOutput);
    networkInfoOutput.appendChild(networkIP4SubnetOutput);
    networkInfoOutput.appendChild(networkIP6AddressOutput);
    networkInfoOutput.appendChild(networkIP6SubnetOutput);
    networkInfoOutput.appendChild(networkMacAddressOutput);
    networkInfoOutput.appendChild(networkIsDhcpOutput);
    networkInfoOutput.appendChild(networkDNSSuffixOutput);

    networkItemHead.appendChild(networkInfoOutput);
    document.getElementById("network-list").appendChild(networkItemHead);
   }
  })).then(si.bluetoothDevices().then(data => {
   // 블루투스 장치 정보 불러오기
   document.getElementById("loading-progress").innerHTML = "블루투스 장치 정보 불러오는 중...";

   for(let i=0;i<data.length;i++){
    let bluetoothItemHead = document.createElement("li");
    let bluetoothInfoOutput = document.createElement("ul");
    bluetoothItemHead.id = `bluetooth-item-${i}`;
    bluetoothItemHead.appendChild(document.createTextNode(`블루투스 장치 #${i}`));

    let bluetoothCanonicalName = data[i].name;
    let bluetoothDevVendor = data[i].manufacturer;
    let bluetoothDevType = data[i].type;

    let bluetoothCanonicalNameOutput = document.createElement("li");
    let bluetoothDevVendorOutput = document.createElement("li");
    let bluetoothDevTypeOutput = document.createElement("li");

    bluetoothCanonicalNameOutput.innerHTML = `블루투스 장치 이름 : ${bluetoothCanonicalName}`;
    bluetoothDevVendorOutput.innerHTML = `블루투스 장치 공급업체 : ${bluetoothDevVendor}`;
    bluetoothDevTypeOutput.innerHTML = `블루투스 장치 유형 : ${bluetoothDevType}`;

    bluetoothInfoOutput.appendChild(bluetoothCanonicalNameOutput);
    bluetoothInfoOutput.appendChild(bluetoothDevVendorOutput);
    bluetoothInfoOutput.appendChild(bluetoothDevTypeOutput);

    bluetoothItemHead.appendChild(bluetoothInfoOutput);
    document.getElementById("bluetooth-list").appendChild(bluetoothItemHead);
   }

  })).then(() => {
     document.getElementById("loading").style.display = "none";
     document.getElementById("sysinfo-body").style.display = "inline-block";
     document.getElementById("sysinfo-datetime").innerHTML = `(기준 일시 : ${new Date().toLocaleString()})`;
  }).catch(err => {
     console.error("시스템 정보 불러오기 중 오류 발생:", err);
     alert(`시스템 정보를 불러오는 중 오류가 발생했습니다.\n\n오류 내용: ${err.message}`);
  });
}

function toggleSection(sectionId,buttonId){
  let button = document.getElementById(buttonId);
  let section = document.getElementById(sectionId);
  if(section){section.style.display = (section.style.display === "none") ? "inline-block" : "none";}
  if(button){button.innerHTML = (section.style.display === "none") ? "+" : "-";}
}

function checkInetConnection(){
  const targetHostIP = "8.8.8.8";
  si.inetLatency(targetHostIP).then(data => {
    let dnsServersList = dns.getServers();
    let dnsServersListText = dnsServersList.join(", ");
    alert(`- 인터넷 연결 상태: 양호 (응답 시간: ${data}ms, 대상 호스트: ${targetHostIP})\r\n- DNS 서버: ${dnsServersListText}`);
    console.log(`- 인터넷 연결 상태: 양호 (응답 시간: ${data}ms, 대상 호스트: ${targetHostIP})\r\n- DNS 서버: ${dnsServersListText}`);
  }).catch(err => {
    alert(`- 인터넷 연결 상태: 불량 (오류: ${err.message})`);
    console.error(`- 인터넷 연결 상태: 불량 (오류: ${err.message})`);
  });
}

window.addEventListener("load", loadSysInfo);

if(window.matchMedia("(prefers-color-scheme: dark)").matches){document.documentElement.setAttribute("data-theme","dark");}
else{document.documentElement.setAttribute("data-theme","light");}