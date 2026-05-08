const fs = require('fs');
const path = require('path');

const directory = '/media/mastesa/62125785-5111-44aa-8957-f426a89276b2/Projects/Personal/BodaKitaa/bodakitaa-FE/src/pages';
const filesToDelete = [
  'AdminDashboard.tsx', 'ClientDashboard.tsx', 'ClientProfilePage.tsx', 
  'ClientRidesPage.tsx', 'LandingPage.tsx', 'LoginPage.tsx', 
  'OwnerDashboard.tsx', 'OwnerFleetPage.tsx', 'OwnerIncomePage.tsx', 
  'OwnerProfilePage.tsx', 'OwnerReportsPage.tsx', 'OwnerRidersPage.tsx', 
  'OwnerTrackRidersPage.tsx', 'RegisterPage.tsx', 'RequestRidePage.tsx', 
  'RiderDashboard.tsx', 'RiderEarningsPage.tsx', 'RiderHistoryPage.tsx', 
  'RiderProfilePage.tsx', 'RiderRequestsPage.tsx', 'RiderVehiclePage.tsx'
];

filesToDelete.forEach(file => {
  const filePath = path.join(directory, file);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Deleted: ${file}`);
    } catch (err) {
      console.error(`Error deleting ${file}: ${err.message}`);
    }
  } else {
    console.log(`File not found: ${file}`);
  }
});
