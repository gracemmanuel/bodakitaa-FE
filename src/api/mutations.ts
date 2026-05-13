import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    tokenAuth(username: $username, password: $password) {
      token
      payload
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: UserInput!) {
    register(input: $input) {
      success
      message
      token
      user {
        id
        email
        fullName
        role
      }
    }
  }
`;

export const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(input: { email: $email }) {
      success
      message
    }
  }
`;

export const CONFIRM_PASSWORD_RESET = gql`
  mutation ConfirmPasswordReset($token: String!, $password: String!) {
    confirmPasswordReset(input: { token: $token, password: $password }) {
      success
      message
    }
  }
`;

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      success
      message
      user {
        id
        fullName
        phone
        email
      }
    }
  }
`;

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(input: { id: $id }) {
      success
      message
      notification {
        id
        isRead
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

export const ASSIGN_RIDER = gql`
  mutation AssignRider($vehicleId: Int!, $riderId: Int!) {
    assignRider(vehicleId: $vehicleId, riderId: $riderId) {
      success
      message
    }
  }
`;

export const REQUEST_RIDE = gql`
  mutation RequestRide($pickupAddress: String!, $destinationAddress: String!, $pickupLat: Float!, $pickupLng: Float!, $destinationLat: Float!, $destinationLng: Float!, $rideType: String!, $midwayStops: String) {
    requestRide(pickupAddress: $pickupAddress, destinationAddress: $destinationAddress, pickupLat: $pickupLat, pickupLng: $pickupLng, destinationLat: $destinationLat, destinationLng: $destinationLng, rideType: $rideType, midwayStops: $midwayStops) {
      ride {
        id
        status
      }
    }
  }
`;

export const ESTIMATE_RIDE = gql`
  mutation EstimateRide($pickupLat: Float!, $pickupLng: Float!, $destinationLat: Float!, $destinationLng: Float!, $rideType: String, $midwayStops: String) {
    estimateRide(pickupLat: $pickupLat, pickupLng: $pickupLng, destinationLat: $destinationLat, destinationLng: $destinationLng, rideType: $rideType, midwayStops: $midwayStops) {
      estimate {
        estimatedDistanceKm
        estimatedFareTzs
      }
    }
  }
`;

export const RATE_RIDE = gql`
  mutation RateRide($rideId: Int!, $stars: Int!, $comment: String) {
    rateRide(rideId: $rideId, stars: $stars, comment: $comment) {
      success
      message
    }
  }
`;

export const UPDATE_VEHICLE_DETAILS = gql`
  mutation UpdateVehicleDetails(
    $vehicleId: Int!, 
    $tinNumber: String, 
    $engineNumber: String, 
    $engineCapacityCc: Int, 
    $isTbsInspected: Boolean, 
    $transportGroupDetails: String, 
    $chassisNumber: String, 
    $insurancePolicyNumber: String, 
    $insuranceExpiry: Date
  ) {
    updateVehicleDetails(
      vehicleId: $vehicleId, 
      tinNumber: $tinNumber, 
      engineNumber: $engineNumber, 
      engineCapacityCc: $engineCapacityCc, 
      isTbsInspected: $isTbsInspected, 
      transportGroupDetails: $transportGroupDetails, 
      chassisNumber: $chassisNumber, 
      insurancePolicyNumber: $insurancePolicyNumber, 
      insuranceExpiry: $insuranceExpiry
    ) {
      success
      message
      vehicle {
        id
      }
    }
  }
`;

export const CREATE_RIDER_CONTRACT = gql`
  mutation CreateRiderContract(
    $vehicleId: Int!, 
    $riderId: Int!, 
    $startDate: Date!, 
    $expirationDate: Date!
  ) {
    createRiderContract(
      vehicleId: $vehicleId, 
      riderId: $riderId, 
      startDate: $startDate, 
      expirationDate: $expirationDate
    ) {
      success
      message
      contract {
        id
      }
    }
  }
`;

