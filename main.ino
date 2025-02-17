#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

const char* ssid = "ssid";
const char* password = "password";
const int buttonPin = 0; // D3 and FLASH (GPIO0)
const int switchPin = 2; // D4 and Built-in LED(GPIO2)
bool switchState = false;

ESP8266WebServer server(80);
IPAddress local_IP(192, 168, 0, 2);
IPAddress gateway(192, 168, 0, 1);
IPAddress subnet(255, 255, 255, 0);

void handleRoot() {
  String html = "";
  html += "<html>";
  html += "  <head>";
  html += "    <title>IoT Switch</title>";
  html += "    <style>";
  html += "      body {";
  html += "        display: flex;";
  html += "        align-items: center;";
  html += "        justify-content: center;";
  html += "      }";
  html += "      label {";
  html += "        position: relative;";
  html += "        display: inline-block;";
  html += "        width: 150px;";
  html += "        height: 83px;";
  html += "      }";
  html += "      input {";
  html += "        opacity: 0;";
  html += "        width: 0;";
  html += "        height: 0;";
  html += "      }";
  html += "      input {";
  html += "        opacity: 0;";
  html += "        width: 0;";
  html += "        height: 0;";
  html += "      }";
  html += "      span {";
  html += "        cursor: pointer;";
  html += "        position: absolute;";
  html += "        top: 0;";
  html += "        left: 0;";
  html += "        right: 0;";
  html += "        bottom: 0;";
  html += "        border-radius: 83px;";
  html += "        background-color: #ccc;";
  html += "        transition: .4s;";
  html += "      }";
  html += "      span::before {";
  html += "        content: '';";
  html += "        position: absolute;";
  html += "        left: 8px;";
  html += "        top: 8px;";
  html += "        width: 67px;";
  html += "        height: 67px;";
  html += "        border-radius: 50%;";
  html += "        background-color: white;";
  html += "        transition: .4s;";
  html += "      }";
  html += "      input:focus + span {";
  html += "        box-shadow: 0 0 1px #2196F3;";
  html += "      }";
  html += "      input:checked + span {";
  html += "        background-color: #2196F3;";
  html += "      }";
  html += "      input:checked + span::before {";
  html += "        transform: translateX(67px);";
  html += "      }";
  html += "    </style>";
  html += "    <script src='https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js'></script>";
  html += "    <script>";
  html += "      function toggle(checkbox) {";
  html += "        $.get('/toggle', function(data) {";
  html += "          checkbox.checked = data.state === '1';";
  html += "        });";
  html += "      }";
  html += "      function updateState() {";
  html += "        $.get('/state', function(data) {";
  html += "          document.querySelector('input').checked = data.state === '1';";
  html += "        });";
  html += "      }";
  html += "      updateState();";
  html += "      setInterval(updateState, 500);";
  html += "    </script>";
  html += "  </head>";
  html += "  <body>";
  html += "    <label>";
  html += "      <input type='checkbox' onclick='toggle(this)'>";
  html += "      <span></span>";
  html += "    </label>";
  html += "  </body>";
  html += "</html>";
  server.send(200, "text/html", html);
}

void handleToggle() {
  switchState = !switchState;
  digitalWrite(switchPin, switchState ? HIGH : LOW);
  server.send(200, "application/json", "{\"state\":\"" + String(switchState ? 1 : 0) + "\"}");
}

void handleState() {
  server.send(200, "application/json", "{\"state\":\"" + String(switchState ? 1 : 0) + "\"}");
}

void setup() {
  Serial.begin(9600);
  pinMode(switchPin, OUTPUT);
  digitalWrite(switchPin, LOW);
  pinMode(buttonPin, INPUT_PULLUP);

  if (!WiFi.config(local_IP, gateway, subnet)) {
    Serial.println("Failed to configure static IP address");
  }

  WiFi.begin(ssid, password);
  Serial.println("Connecting to Wi-Fi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.print("Wi-Fi connected successfully | IP: ");
  Serial.println(WiFi.localIP());

  server.on("/", handleRoot);
  server.on("/home", handleRoot);
  server.on("/toggle", handleToggle);
  server.on("/state", handleState);
  server.begin();
  Serial.println("HTTP server started");
}

int lastButtonState = HIGH;
void loop() {
  server.handleClient();
  
  int buttonState = digitalRead(buttonPin);
  if (buttonState != lastButtonState && buttonState == LOW) {
    switchState = !switchState;
    digitalWrite(switchPin, switchState ? HIGH : LOW);
    delay(50);
  }

  lastButtonState = buttonState;
}
