import { gql } from '@apollo/client';

export const GET_ME = gql`
  query GetMe {
    me {
      id
      fullName
      email
      phone
      role
      licenseNumber
      plateNumber
      companyName
      taxId
    }
  }
`;

export const GET_CLIENT_STATS = gql`
  query GetClientStats {
    clientStats {
      totalRides
      totalSpent
      loyaltyPoints
      carbonSaved
      activeRide {
        id
        pickup
        destination
        status
        estimatedArrival
        rider {
          fullName
          phone
          plateNumber
          rating
        }
      }
    }
  }
`;

export const GET_RIDE_HISTORY = gql`
  query GetRideHistory($page: Int, $pageSize: Int) {
    rideHistory(page: $page, pageSize: $pageSize) {
      total
      rides {
        id
        pickup
        destination
        date
        amount
        status
        distance
        duration
        paymentMethod
        rider {
          fullName
          rating
          plateNumber
        }
      }
      }
    }
`;

export const GET_RIDER_STATS = gql`
  query GetRiderStats {
    riderStats {
      todayEarnings
      tripsCompleted
      onlineTime
      rating
      targetAmount
      targetCompletedAmount
      weeklyEarnings {
        day
        amount
        trips
        onlineHours
      }
    }
  }
`;
