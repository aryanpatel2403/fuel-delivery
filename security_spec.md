# Security Specification & Threat Model for FuelUp

## 1. Data Invariants
- Users can read and write only their own profile under `/users/{userId}`.
- Fuel rates on `/pumps/{pumpId}` can only be altered by authenticated Admins or authorized dispatch systems. Public read is permitted for station finding and price transparency.
- Orders `/orders/{orderId}`:
  - Customers can create orders where `customerId == request.auth.uid`.
  - Customers can read orders where `customerId == request.auth.uid`.
  - Assigned drivers or Admins can read and update the order delivery status (`dispatched`, `out_for_delivery`, `arrived`, `completed`, `driverLat`, `driverLng`).
  - Terminal state locking: completed or cancelled orders cannot be rewritten by customers.
  - Customers cannot tamper with the fuel rate or alter other users' orders.
- Drivers `/drivers/{driverId}`: Read access allowed for live location and bowser status; write access restricted to assigned driver or Admin.
- Admins `/admins/{adminId}`: Restricted strictly to existing admin documents or designated system operators (`24172022025@gnu.ac.in`).

## 2. The Dirty Dozen Payloads
1. **Unauthenticated Order Placement**: Placing an order with `request.auth == null` -> DENIED.
2. **Customer ID Spoofing**: User A creating an order with `customerId: "userB"` -> DENIED.
3. **Cross-Customer Order Read**: User A listing or reading User B's order without matching `customerId` -> DENIED.
4. **Price Modification by Customer**: Customer modifying `pricePerLiter` or `totalAmount` on existing order -> DENIED.
5. **Unauthorized Pump Price Tampering**: Regular customer setting `petrolPrice: 1.0` on `/pumps/pump-1` -> DENIED.
6. **Self-Promoted Admin Role**: User setting their own role to `admin` in `/users/{userId}` -> DENIED.
7. **Junk ID Poisoning**: Creating an order with a 2048-byte invalid regex ID -> DENIED.
8. **Ghost Field Injection**: Adding unapproved shadow fields (`isVip: true`, `bypassPayment: true`) during update -> DENIED.
9. **Terminal State Reversal**: Customer reverting a `completed` order back to `placed` -> DENIED.
10. **Driver Lat/Lng Spoofing by Non-Driver**: Another user writing fake coordinates to an active order -> DENIED.
11. **Negative Volume / Price Attack**: Creating an order with `quantityLiters: -50` or `pricePerLiter: 0` -> DENIED.
12. **PII Harvesting via Blanket List**: Scraping `/users` without `isOwner()` or `isAdmin()` check -> DENIED.
