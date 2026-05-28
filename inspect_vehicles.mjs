import https from 'https';

const projectId = 'vietbachcorp-6cd8c';
const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/vmVehicles`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            const vehicles = json.documents.map(doc => {
                const fields = doc.fields;
                return {
                    name: fields.name?.stringValue,
                    licensePlate: fields.licensePlate?.stringValue,
                    nextInspection: fields.nextInspection?.stringValue
                };
            });
            console.log('Vehicle Data:', JSON.stringify(vehicles, null, 2));
        } catch (e) {
            console.error('Error parsing data:', data);
        }
    });
});
