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