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
    - Run ```daphne -p 8001 MPP.asgi:application``` to activate the WebSocket
    - Once the app starts a new thread is created (view apps.py in bookings) which generates new bookings every 2 seconds.
    - The WebSocket methods are defined in consumer.py and implement the Django 'channels' api for websockets.
    - In the frontend notice the incoming data in the list and in the charts in real time
  - File Uploads
    - Go to /files route in the frontend and upload / download server media.
    - In the backend media is saved under MPP/media/uploads.

### Assignment 6: Gold Tier
- Bronze Tier
  - Added two new classes: Hotels and Rooms
  - Both classes have full CRUD operation availability which can be tested from the frontend - see relevant routes from the dashboard.
  - Filtering and Sorting can be done on all fields of the entities, including on the foreign key Hotel-Room and multiple criteria at once. Can also be tested from the Hotels / Rooms browsing pages.
  - Django ORM was used to create the models (default ORM of the framework). See bookings>models>*.py files.
- Silver Tier
  - Populating Tables: 
    - Run ```set DJANGO_SETTINGS_MODULE=MPP.MPP.settings_loadtest``` to get in the test environment database
    - Run ```python loadtest.py```
    - Data will now be generated ~500.000 entities
    - Run ```set DJANGO_SETTINGS_MODULE=MPP.MPP.settings``` only after testing the Silver Tier to get back to the development database
  - Performance Optimization:
    - Added Indexes to Hotel ratings, Room hotels (foreign key) & price per night, Bookings start date & end date
    - Using select_related query optimization to get relevant data before it is actually needed saving time on those trips to the db (e.g. the hotel to which a room belongs)
    - Complex Statistical Query: Which hotels have an average room price above the overall average across all hotels — and how do their total capacity and rating compare? - see booking>views>statistics.py
  - Performance Testing:
    - Download & Open JMeter from Apache (e.g. on my machine ```cd C:\apache-jmeter-5.6.3\bin``` and then ```jmeter.bat```)
    - Uncomment this line in manage.py ```# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "MPP.loadtest_settings")``` and run the server with ```python manage.py runserver```
    - A GUI screen will open. Load the loadtest.jmx file and hit the green button to start running. Watch the listeners and analyze results. You can view the difference between having and not having indexes by removing migration 0005 (this adds indexes).
    - Results after index optimizations:
      - Average: 109714
      - Min: 19647
      - Max: 142953
      - Std. Dev.: 291507.15
      - Throughput: 24.7 /min (Requests)
- Gold Tier
  - Authentication System
    - Added basic Register / Login Functionality using Django's builtin authentication system
    - Added Register / Login Serializers and Views
    - Added Frontend Api Calls for the Views
    - Added authentication pages - /auth/, /auth/login, /auth/register
    - In case a user is not authenticated it will be automatically redirected to /auth/
  - User Roles
    - Added a BookingUser custom user model extending Django's AbstractUser (so it has a bunch of fields - phone number, email, full name, etc.)
    - Even more the BookingUser can have one of two roles: user or admin
    - In the frontend the role is also stored in local storage, based on that the admin gets the additional Dashboard route in the Header
  - Logging System
    - Added OperationLogs model which stores the operation type, which user performed it, the object and model upon the operation was done and the timestamp
    - Added a decorator to automatically pick up the request and user and create a log entity (see utils.py)
  - Background Monitoring Thread
    - Added Monitored User model which stores the monitored user and the time he was flagged
    - Added settings configurations for the monitoring mechanism thresholds
    - Added thread running on ```python manage.py runserver``` and bookings app ready
  - Admin Dashboard
    - Added admin permission decorator check
    - Added monitored-users view only accessible to admins
    - Added operation-log view only accessible to admins
    - Added admin dashboard  at the path ```/dashboard```
  - Simulated Attack Scenario
    - Perform a high volume of crud operations
    - Go to ```/dashboard``` and see the monitored user and their logs
    - In the backend console you can see the message "We have a suspicious user: user_id"

### Assignment 7: Deployment
- Bronze
  - Added Dockerfile for backend
  - Added .env file with sensitive information
  - Added debug security settings
  - Modified settings to use environment variables
  - Ran ```docker build -t gcr.io/ubb-mpp/backend .``` to build image and then ```docker push gcr.io/ubb-mpp/backend``` to push to container registry and then ```gcloud run deploy backend --image gcr.io/ubb-mpp/backend --platform managed --region europe-west1 --allow-unauthenticated --set-env-vars="SECRET_KEY='django-insecure&m&h=3n9*^+gco0zd4\$8j2&oa0^^)w+efuh!v488r-mytixwi67',DEBUG=0,ALLOWED_HOSTS=*.run.app" --cpu=1 --memory=512Mi --min-instances=0 --max-instances=1``` to deploy
  - Backend successfully deployed at ```https://backend-587575638625.europe-west1.run.app```
- Silver
  - Added Dockerfile for Next.js frontend
  - Added .env file with sensitive information
  - Modified config file to use environment variables
  - Ran ```cd frontend ``` and then ```docker build -t gcr.io/ubb-mpp/frontend .``` to build and then ```docker push gcr.io/ubb-mpp/frontend``` to publish the image and finally ```gcloud run deploy frontend --image gcr.io/ubb-mpp/frontend --platform managed --region europe-west1 --allow-unauthenticated --set-env-vars="NEXT_PUBLIC_API_URL=https://backend-587575638625.europe-west1.run.app" --cpu=1 --memory=512Mi --min-instances=0 --max-instances=1``` to deploy
  - Modified backend CORS and CSRF allowed lists to include the new backend/frontend
  - Frontend successfully deployed at ```https://frontend-587575638625.europe-west1.run.app```
- Gold
  - Created a DockerCompose file to orchestrate the backend, frontend dockerfiles and the sqlite3 database volume
  - Added a cloudbuild.yaml file to lay out the steps for building and pushing both backend and frontend docker images
  - Added a deploy shell to build and deploy the entire app on Google Cloud on Cloud Run (equivalent to Amazon ECS)

### Assignment 8
- Bronze
  - Both backend and frontend were automatically assigned SSL certificates by Google Cloud Provider upon deployment
- Silver
  - Authentication was implemented and described thoroughly in Assignment6 (see above) - using JWT and localStorage 
- Gold
  - Not implemented :(