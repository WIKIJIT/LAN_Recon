import { IonContent, IonHeader, IonMenuButton, IonPage, IonToolbar, IonInput, IonButton, IonAlert, IonLoading, IonSelect, IonSelectOption, IonLabel, IonItem } from '@ionic/react';
import { useParams, useHistory } from 'react-router';
import ExploreContainer from '../components/ExploreContainer';
import './Page.css';
import { useState } from 'react';

interface Device {
  "IP Address": string;
  "MAC Address": string;
  "Manufacturer": string;
  "OS Details": string;
  "Hostname": string;
}

const Page: React.FC = () => {

  const { field1, field2, field3 } = useParams<{ field1: string; field2: string; field3: string; }>();
  const [input1, setInput1] = useState(field1);
  const [input2, setInput2] = useState(field2);
  const [input3, setInput3] = useState(field3);
  const [showAlert, setShowAlert] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [devices, setDevices] = useState<{ [key: string]: Device }>({});
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const history = useHistory();

  const validateInput = (input: string, setInput: (value: string) => void) => {
    const intInput = parseInt(input);
    if (isNaN(intInput) || intInput < 0 || intInput > 255) {
      setShowAlert(true);
      setInput('');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setShowLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/${input1}.${input2}.${input3}`);
      const data = await response.json();
      setDevices(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setShowLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          192.168.
          <IonInput value={input1} onIonChange={e => {setInput1(e.detail.value!); validateInput(e.detail.value!, setInput1)}} placeholder="___" style={{ width: '50px' }} />
          .
          <IonInput value={input2} onIonChange={e => {setInput2(e.detail.value!); validateInput(e.detail.value!, setInput2)}} placeholder="___" style={{ width: '50px' }} />
          /
          <IonInput value={input3} onIonChange={e => {setInput3(e.detail.value!); validateInput(e.detail.value!, setInput3)}} placeholder="___" style={{ width: '50px' }} />
          <IonButton onClick={handleSubmit}>Submit</IonButton>
        </div>
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'Invalid Input'}
          message={'Please enter a number between 0 and 255 for each field.'}
          buttons={['OK']}
        />
        <IonLoading
          isOpen={showLoading}
          onDidDismiss={() => setShowLoading(false)}
          message={'Please wait...'}
        />
        <IonItem>
          <IonLabel>Select Device</IonLabel>
          <IonSelect value={selectedDevice} placeholder="Select One" onIonChange={e => setSelectedDevice(e.detail.value)}>
            {Object.keys(devices).map(device => (
              <IonSelectOption key={device} value={device}>
                {device} - {devices[device]?.Manufacturer || 'Unknown'}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>
        {selectedDevice && (
          <div>
            <p>IP Address: {devices[selectedDevice]?.["IP Address"] || 'Unknown'}</p>
            <p>MAC Address: {devices[selectedDevice]?.["MAC Address"] || 'Unknown'}</p>
            <p>Manufacturer: {devices[selectedDevice]?.Manufacturer || 'Unknown'}</p>
            <p>OS Details: {devices[selectedDevice]?.["OS Details"] || 'Unknown'}</p>
            <p>Hostname: {devices[selectedDevice]?.Hostname || 'Unknown'}</p>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Page;