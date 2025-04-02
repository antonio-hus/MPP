# MPP - Hus Lucian Antonio, 924

---

#### Choosen Domain: Hotels   
#### Main Entity: Booking

---
## Booking Model Schema

The `Booking` model represents reservations that impact available slots.

### Fields:

| Field Name      | Type         | Description                                                                                    |
|-----------------|--------------|------------------------------------------------------------------------------------------------|
| `id`            | `UUID`       | Unique identifier for the booking. Auto-generated.                                             |
| `customerName`  | `CharField(127)` | Name of the customer making the booking.                                                       |
| `customerEmail` | `CharField(127)` | Email address of the customer.                                                                 |
| `customerPhone` | `CharField(20)` | Phone number of the customer.                                                                  |
| `startDate`     | `DateField`  | Start date of the booking.                                                                     |
| `endDate`       | `DateField`  | End date of the booking.                                                                       |
| `state`         | `CharField(10)` | Status of the booking. Choices: `Pending`, `Confirmed`, `Cancelled`, `Completed`. Default is `Pending`. |
| `createdAt`     | `DateTimeField` | Timestamp when the booking was created. Auto-generated.                                        |
| `completedAt`   | `DateTimeField` | Timestamp when the booking was completed. Nullable.                                            |

### Booking States:

The `state` field can have the following values:

- `PENDING`: The booking is pending confirmation.
- `CONFIRMED`: The booking has been confirmed.
- `CANCELLED`: The booking was cancelled.
- `COMPLETED`: The booking has been completed.

---

### Assignment 3:

#### Overview:
This assignment configures the Next.js frontend application with live reloading and implements the layout strictly adhering to the provided Figma design. Data is dynamically fetched from the Django backend via REST API calls.

To run and test the features of this application:
1. Clone the repository
2. Open one terminal to run the backend (use python manage.py runserver)
3. Open another terminal to run the frontend (move to frontend directory and use npm run dev)
4. Open localhost:3000/ inside the browser

##### Core Functionalities:
Add Entity (Create Booking)  
Navigation:  
From the Dashboard (/) or the Navigation Bar, select the option to "Create Booking".  

Form Details:  
Complete the booking form by providing the following details:  

- Full Name: Must contain a minimum of 2 characters.  
- Email: Utilizes HTML's built-in email validation.  
- Phone: Must consist of exactly 10 digits.  
- Start Date and End Date: Both must be valid dates, with the start date occurring before the end date.  
  
Error Handling:  
If any validations fail, clear and descriptive error messages are displayed.  
  
Post Submission:  
Upon successful form submission, the user is automatically redirected to the booking list page.  
  
Show All Entities (Manage Bookings)  
Access:  
Navigate to the bookings list from the Dashboard (/bookings/) or the Navigation Bar.  
  
Display:  
All bookings are presented as individual cards displaying comprehensive booking information.  
  
Search Functionality:  
  
A search bar at the top of the page allows filtering by the customer's full name.  
Advanced Search Options:  
Accessible via a dropdown, these options allow filtering by email, phone, booking state, a start date after a specified date, and an end date before a specified date.  
  
Reset Filters:  
A "Reset Filters" button is provided to clear all applied filters.  
  
Edit and Delete Booking  
Edit Booking:  
  
Clicking the "Edit" button on a booking card navigates the user to the Booking Editor.  
The editor form is prefilled with the current booking details.  
Users may update the information and save changes, which will redirect them back to the bookings list.  
Alternatively, clicking the "Cancel" button returns the user to the bookings list without applying any changes.
  
Delete Booking:  
  
Clicking the "Delete" button triggers a modal window that confirms the deletion action.  
The user is prompted to confirm the deletion, ensuring that accidental deletions are avoided.

### Assignment 4: Gold Tier

#### Overview:
- Bronze Tier - Achieved from previous assignment (functionalities explained above)  
- Silver Tier 
  - Full Jest Test Coverage for the CRUD API Mock Calls (using in-memory data). Run the tests by right-clicking and pressing Run on the @/utils/mocks/api_mock.test.ts (JetBrains IDE).
  - Statistics Shown on Booking Details Card - Background Color of the Booking Banner and the Booking Badge change based on the Booking State (PENDING, CANCELLED, CONFIRMED, COMPLETED).
- Gold Tier
  - Async Chart Data and Real-Time Updates - we use the useEffect Hook, to fetch data real-time every 5 seconds and reload the chart data in an asynchronous manner. There are 3 charts: Pie Chart: Booking State Distribution, Bar & Line Charts: Daily Booking Counts. To inspect them toggle in the main booking list to metrics view.
  - Pagination - A page displays at most 5 Bookings. If there exist more than 5 bookings in the query result set, at the bottom of the page will be a page navigator. On reload page is set back to first.

### Assignment 4: Gold Tier

#### Overview
- Bronze Tier
  - Run Backend from main folder (MPP) using   ```python manage.py runserver```  
  - Run Frontend from frontend folder (MPP/frontend) using ```npm run dev```
  - Create / Edit / Delete / Get Bookings and watch the terminal to see requests & responses
  - Unit Tests: Run from main folder (MPP) using ```python manage.py test --verbosity=2```
  - Server Side Validation can be seen in the pages for creating bookings and edit bookings
- Silver Tier
  - Disconnect from All Wi-fi and Bluetooth connections to view offline mode
  - Stop running Backend by using Ctrl+C in Backend terminal to view server offline mode
  - The app will still be usable from the frontend in cache mode. Upon restarting the server all changes will be synced
  - Endless Scrolling: On the bookings page scroll down and notice that every 10 bookings a hot-reload is performed!
- Gold Tier
  - Async Chart Data via WebSocket
    - Go to MPP>MPP>settings.py and set WS_FLAG to True to activate the WebSocket on the next run of the Backend
    - Once the app starts a new thread is created (view apps.py in bookings) which generates new bookings every 2 seconds.
    - The WebSocket methods are defined in consumer.py and implement the Django 'channels' api for websockets.
    - In the frontend notice the incoming data in the list and in the charts in real time
  - File Uploads
    - Go to /files route in the frontend and upload / download server media.
    - In the backend media is saved under MPP/media/uploads.