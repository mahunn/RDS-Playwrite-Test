import { test, expect } from '../../../src/fixtures/base';
import { RdsStudentLandingPage } from '../../../src/pages/RdsStudentLandingPage';
import parkingTemplate from '../../data/car-parking-data.json';
import studentData from '../../data/rds-student-data.json';

test.describe('NSU RDS Student Car Parking Service', () => {
  test.use({ storageState: 'playwright/.auth/student.json' });

  test('navigates to Car Parking under Services, submits application form, and verifies request @smoke @critical', async ({
    page,
  }) => {
    test.slow();

    const studentLandingPage = new RdsStudentLandingPage(page);

    await test.step('Navigate to student dashboard', async () => {
      await studentLandingPage.goto(studentData.student);
      await expect(page).toHaveURL(/students\/landing/);
      await expect(studentLandingPage.welcomeHeading).toBeVisible();
    });

    let carParkingPage: any;
    await test.step('Navigate to Services -> Car Parking', async () => {
      carParkingPage = await studentLandingPage.navigateToCarParking();
      await expect(page).toHaveURL(/carParkingRequestDashboard/);
      await expect(carParkingPage.pageHeading).toBeVisible();
      await expect(carParkingPage.addNewButton).toBeVisible();
    });

    const uniqueId = Math.floor(1000 + Math.random() * 9000).toString();
    const uniqueRegNo = `${parkingTemplate.vehicleRegPrefix}-${uniqueId}`;
    const parkingData = {
      vehicleType: parkingTemplate.vehicleType,
      vehicleRegNo: uniqueRegNo,
      vehicleModel: parkingTemplate.vehicleModel,
      vehicleManufacturer: parkingTemplate.vehicleManufacturer,
      driverType: parkingTemplate.driverType,
      driverAddress: parkingTemplate.driverAddress,
      drivingLicenseNo: `${parkingTemplate.drivingLicenseNoPrefix}${uniqueId}`,
      drivingLicenseExpiry: parkingTemplate.drivingLicenseExpiry,
      driverNID: `${parkingTemplate.driverNIDPrefix}${uniqueId}`,
      vehicleEngineNo: `${parkingTemplate.vehicleEngineNoPrefix}${uniqueId}`,
      driverContactNo: parkingTemplate.driverContactNo,
      vehiclePlateNo: `${parkingTemplate.vehiclePlateNoPrefix}-${uniqueId}`,
      semesterLabel: parkingTemplate.semesterLabel,
    };

    await test.step('Open Add New parking request form', async () => {
      await carParkingPage.openAddNewForm();
      await expect(carParkingPage.vehicleTypeSelect).toBeVisible();
    });

    await test.step('Fill car parking application form', async () => {
      await carParkingPage.fillParkingForm(parkingData);
      await expect(carParkingPage.vehicleRegNoInput).toHaveValue(uniqueRegNo);
    });

    await test.step('Save parking request and verify in request table', async () => {
      await carParkingPage.submitForm();
      await expect(page).toHaveURL(/carParkingRequestDashboard/);
      const createdRow = carParkingPage.getRequestRowByVehicleReg(uniqueRegNo);
      await expect(createdRow).toBeVisible();
    });
  });
});
