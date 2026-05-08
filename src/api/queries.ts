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

export const GET_PENDING_RIDE_REQUESTS = gql`
  query GetPendingRideRequests($riderLat: Float!, $riderLng: Float!) {
    pendingRideRequests(riderLat: $riderLat, riderLng: $riderLng) {
      id
      pickupAddress
      destinationAddress
      pickupLat
      pickupLng
      destinationLat
      destinationLng
      totalFare
      baseFare
      rideType
      requestedAt
      status
      client {
        id
        fullName
        phone
        rating
      }
    }
  }
`;

export const GET_ACTIVE_RIDE_FOR_RIDER = gql`
  query GetActiveRideForRider {
    myAcceptedRide {
      id
      pickupAddress
      destinationAddress
      pickupLat
      pickupLng
      destinationLat
      destinationLng
      totalFare
      status
      rideType
      requestedAt
      client {
        id
        fullName
        phone
        rating
      }
    }
  }
`;

export const GET_MY_ACTIVE_REQUEST = gql`
  query GetMyActiveRequest {
    myActiveRequest {
      id
      status
      pickupAddress
      destinationAddress
      pickupLat
      pickupLng
      destinationLat
      destinationLng
      totalFare
      rideType
      requestedAt
      riderLat
      riderLng
      riderLocationUpdatedAt
      rider {
        id
        fullName
        phone
        rating
        plateNumber
        licenseNumber
      }
    }
  }
`;

export const CONFIRM_RIDE = gql`
  mutation ConfirmRide($rideId: Int!) {
    confirmRide(rideId: $rideId) {
      success
      message
      ride {
        id
        status
      }
    }
  }
`;

export const ACCEPT_RIDE = gql`
  mutation AcceptRide($rideId: Int!) {
    acceptRide(rideId: $rideId) {
      success
      message
      ride {
        id
        status
        pickupLat
        pickupLng
        destinationLat
        destinationLng
        pickupAddress
        destinationAddress
        totalFare
        client {
          fullName
          phone
          rating
        }
      }
    }
  }
`;

export const START_RIDE = gql`
  mutation StartRide($rideId: Int!) {
    startRide(rideId: $rideId) {
      success
      message
      ride {
        id
        status
      }
    }
  }
`;

export const COMPLETE_RIDE = gql`
  mutation CompleteRide($rideId: Int!) {
    completeRide(rideId: $rideId) {
      success
      message
      ride {
        id
        status
        finalFare
      }
    }
  }
`;

export const UPDATE_RIDER_LOCATION = gql`
  mutation UpdateRiderLocation($rideId: Int!, $lat: Float!, $lng: Float!) {
    updateRiderLocation(rideId: $rideId, lat: $lat, lng: $lng) {
      success
    }
  }
`;

export const GET_MY_NOTIFICATIONS = gql`
  query GetMyNotifications {
    myNotifications {
      id
      title
      message
      notificationType
      isRead
      createdAt
    }
  }
`;
