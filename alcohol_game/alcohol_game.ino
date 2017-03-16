#include "pitches.h"

const int FIRST_LED  = 3;
const int LAST_LED   = 12;
const int BUTTON_PIN = 2;

int lastButton = LOW;
int min_level = -1;
int max_level = 0;

int t = 0;

boolean isCalibrated = false;

const int CALIBRATION_FLOOR = 500;

void setup() 
{      
  Serial.begin(9600);
  
  pinMode(BUTTON_PIN, INPUT);
  
  for (int i = FIRST_LED; i <= LAST_LED; i++) 
  {
    pinMode(i, OUTPUT);
  } 
}

void loop() 
{ 
  int buttonRead = digitalRead(BUTTON_PIN);
  
  int value = analogRead(0);
  if (buttonRead == HIGH && isCalibrated)
  {
    if (min_level < 0)
    {
      min_level = value;
      clearAllLEDs();
    }
    
    if (value > max_level)
    {
      max_level = value;
    }
  }
  else
  {
    if (lastButton == HIGH)
    {
      lightPins();
    }
    
    if (value > CALIBRATION_FLOOR)
    {
      isCalibrated = false;
      calibratingAnimation();
    }
    else
    {
      isCalibrated = true;
      readyAnimation();
    }
    
    max_level = 0;
    min_level = -1;
  }
  
  lastButton = buttonRead;
}

void lightPins()
{
  int alcohol_level = float(max_level - min_level) / (1023 - min_level) * 10;
  float alcohol_byte = float(max_level - min_level) / (1023 - min_level);
  unsigned char alcohol_char = alcohol_byte * 255;
  //Serial.print("level: "); Serial.print(alcohol_level); Serial.print("\tbyte: "); Serial.println(alcohol_char);
  Serial.write(alcohol_char);
  
  for (int i = FIRST_LED; i < FIRST_LED + alcohol_level; i++) 
  {
    digitalWrite(i, HIGH);    
    delay(200);
    if (i == LAST_LED)
    {
      playTune();
    }
  }
  
  delay (2500);
  
  for (int i = FIRST_LED + alcohol_level; i >= FIRST_LED; i--) 
  {
    digitalWrite(i, LOW);
    delay(200);
  }
}

void readyAnimation() {
   switch (t % 3) {
    case 0:
      digitalWrite(FIRST_LED + 0, HIGH);
      digitalWrite(FIRST_LED + 1, HIGH);
      digitalWrite(FIRST_LED + 2, HIGH);
      for (int i = FIRST_LED + 3; i <= LAST_LED; ++i) {
        digitalWrite(i, LOW);
      }
      break;
    case 1:
      digitalWrite(FIRST_LED + 0, LOW);
      digitalWrite(FIRST_LED + 1, LOW);
      digitalWrite(FIRST_LED + 2, LOW);
      digitalWrite(FIRST_LED + 3, HIGH);
      digitalWrite(FIRST_LED + 4, HIGH);
      digitalWrite(FIRST_LED + 5, HIGH);
      digitalWrite(FIRST_LED + 6, LOW);
      digitalWrite(FIRST_LED + 7, LOW);
      digitalWrite(FIRST_LED + 8, LOW);
      digitalWrite(FIRST_LED + 9, LOW);
      break;
    case 2:
      for (int i = FIRST_LED; i <= FIRST_LED + 6; ++i) {
        digitalWrite(i, LOW);
      }
      digitalWrite(FIRST_LED + 6, HIGH);
      digitalWrite(FIRST_LED + 7, HIGH);
      digitalWrite(FIRST_LED + 8, HIGH);
      digitalWrite(FIRST_LED + 9, HIGH);
      break;
  }
  
  delay(300);
  ++t;
}

void calibratingAnimation()
{
  digitalWrite(t % 10 + FIRST_LED, HIGH);
  delay(100);
  digitalWrite(t % 10 + FIRST_LED, LOW);
  ++t;
}

void clearAllLEDs() 
{
  for (int i = FIRST_LED; i <= LAST_LED; ++i) {
    digitalWrite(i, LOW);
  }
}

void playTune()
{
  const int piezoPin = 1;
  
  int melody[] = {
    NOTE_B3, NOTE_B3, NOTE_DS4, NOTE_FS4, NOTE_DS4, NOTE_FS4
  };
  
  int noteDurations[] = {
    8, 8, 8, 4, 8, 2 
  };

  for (int thisNote = 0; thisNote < 6; thisNote++) {
    int noteDuration = 1000/noteDurations[thisNote];
    tone(piezoPin, melody[thisNote],noteDuration);
    
    int pauseBetweenNotes = noteDuration * 1.30;
    delay(pauseBetweenNotes);
    
    noTone(piezoPin);
  }
}

