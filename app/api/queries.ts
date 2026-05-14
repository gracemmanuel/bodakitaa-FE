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
      kycStatus
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
      weeklyTotal
      avgEarningPerRide
      activeVehiclePlate
      activeRide {
        id
        pickupAddress
        destinationAddress
        pickupLat
        pickupLng
        destinationLat
        destinationLng
        totalFare
        status
        client {
          fullName
          phone
          rating
        }
      }
      pendingRequests {
        id
        pickupAddress
        destinationAddress
        totalFare
        client {
          fullName
          rating
        }
      }
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

export const GET_RIDER_WALLET = gql`
  query GetRiderWallet {
    myWallet {
      id
      balanceTzs
    }
    myTransactions {
      id
      transactionType
      amountTzs
      balanceAfterTzs
      status
      description
      createdAt
    }
  }
`;

export const GET_RIDER_VEHICLE = gql`
  query GetRiderVehicle {
    myVehicle {
      id
      make
      modelName
      year
      plateNumber
      status
      fuelType
      odometerKm
      maintenanceStatus
      lastOilChangeKm
      daysToInsuranceExpiry
      daysToInspection
      createdAt
    }
    myFuelLogs {
      id
      litersAdded
      totalCostTzs
      odometerAtFillKm
      refilledAt
    }
  }
`;

export const GET_OWNER_STATS = gql`
  query GetOwnerStats {
    ownerStats {
      totalFleetRevenue
      activeBikes
      totalBikes
      activeRiders
      avgFleetRating
      alertsCount
      weeklyRevenueData
      dailyRevenueData
    }
  }
`;

export const GET_ALL_RIDERS = gql`
  query GetAllRiders {
    allRiders {
      id
      fullName
      phone
      rating
      totalTrips
      kycStatus
      assignedVehicle {
        plateNumber
      }
    }
  }
`;


export const CHECK_EMAIL = gql`
  query CheckEmail($email: String!) {
    checkEmail(email: $email)
  }
`;

export const GET_MY_FLEET = gql`
  query GetMyFleet {
    myFleet {
      id
      make
      modelName
      plateNumber
      year
      status
      todayEarnings
      targetEarnings
      maintenanceStatus
      chassisNumber
      engineNumber
      engineCapacityCc
      tinNumber
      isTbsInspected
      insurancePolicyNumber
      insuranceExpiry
      logbook
      insuranceDoc
      ownershipTransferDoc
      commercialRegistrationDoc
      localAuthorityPermits
      transportGroupDetails
      logbookControlNumber
      insuranceStickerNumber
      latraLicenseNumber
      assignedRider {
        id
        fullName
        phone
      }
      contracts {
        id
        rider {
          fullName
        }
        startDate
        expirationDate
        isActive
      }
    }
  }
`;

export const GET_MY_RIDERS = gql`
  query GetMyRiders {
    myRiders {
      id
      fullName
      phone
      rating
      isFullyRegistered
      isSuspended
      nidaNumber
      guarantorName
      guarantorPhone
      idCardFront
      idCardBack
      licenseFile
      localAuthorityLetter
      guarantorIdFront
      guarantorIdBack
    }
  }
`;
export const GET_MY_RIDES = gql`
  query GetMyRides {
    myRides {
      id
      pickupAddress
      destinationAddress
      pickupLat
      pickupLng
      destinationLat
      destinationLng
      status
      totalFare
      finalFare
      requestedAt
      rider {
        id
        fullName
        phone
        rating
        plateNumber
      }
    }
  }
`;

export const GET_MY_WALLET = gql`
  query GetMyWallet {
    myWallet {
      id
      balanceTzs
      totalDebtTzs
    }
  }
`;

export const GET_MY_SUBMISSIONS = gql`
  query GetMySubmissions {
    mySubmissions {
      id
      amountTzs
      expectedAmountTzs
      submissionDate
      status
      comment
      referenceNumber
    }
  }
`;

export const GET_RECEIVED_SUBMISSIONS = gql`
  query GetReceivedSubmissions {
    receivedSubmissions {
      id
      amountTzs
      expectedAmountTzs
      submissionDate
      status
      comment
      referenceNumber
      rider {
        id
        fullName
        phone
      }
    }
  }
`;

export const GET_MY_EXPENSES = gql`
  query GetMyExpenses {
    myExpenses {
      id
      category
      amountTzs
      description
      expenseDate
      vehicle {
        id
        plateNumber
      }
    }
  }
`;

export const GET_MY_TRANSACTIONS = gql`
  query GetMyTransactions {
    myTransactions {
      id
      amountTzs
      transactionType
      status
      description
      createdAt
    }
  }
`;
