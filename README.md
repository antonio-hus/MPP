# MPP
Main Entity: Booking

## Booking Model Schema

The `Booking` model represents reservations that impact available slots.

### Fields:

| Field Name      | Type            | Description                                          |
|----------------|----------------|------------------------------------------------------|
| `id`           | `UUID`          | Unique identifier for the booking. Auto-generated. |
| `customer_name`  | `CharField(127)` | Name of the customer making the booking.            |
| `customer_email` | `CharField(127)` | Email address of the customer.                      |
| `customer_phone` | `CharField(20)`  | Phone number of the customer.                       |
| `datetime`     | `DateTimeField`  | Date and time of the booking.                      |
| `state`        | `CharField(10)`  | Status of the booking. Choices: `Pending`, `Confirmed`, `Cancelled`, `Completed`. Default is `Pending`. |
| `created_at`   | `DateTimeField`  | Timestamp when the booking was created. Auto-generated. |
| `completed_at` | `DateTimeField`  | Timestamp when the booking was completed. Nullable. |

### Booking States:

The `state` field can have the following values:

- `PENDING`: The booking is pending confirmation.
- `CONFIRMED`: The booking has been confirmed.
- `CANCELLED`: The booking was cancelled.
- `COMPLETED`: The booking has been completed.

