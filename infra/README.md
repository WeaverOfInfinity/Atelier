# Atelier Infrastructure Documentation

## **Overview**
The Atelier infrastructure is designed as a **3-tier architecture** for high availability and scalability. It consists of the following components:
1. **Frontend Tier**: Handles user-facing requests via a CloudFront distribution and an Application Load Balancer (ALB) connected to an Auto Scaling Group (ASG).
2. **Backend Tier**: Processes business logic via a separate CloudFront distribution, ALB, and ASG.
3. **Database Tier**: Stores application data in a globally replicated DynamoDB table.

Shared resources, such as the VPC and security groups, are used to simplify management and ensure consistent configurations across the infrastructure.

---

## **Infrastructure Components**

### **1. NetworkStack**
**File**: `network-stack.js`

#### **Purpose**
The `NetworkStack` defines the networking layer for the infrastructure. It uses the default VPC and creates security groups for the frontend and backend tiers.

#### **Key Components**
- **VPC**:
  - Uses the default VPC (`ec2.Vpc.fromLookup`) to simplify setup.
  - Exports the VPC ID and public subnet IDs for use in other stacks.

- **Security Groups**:
  - **FrontendAlbSG**: Allows public traffic to the frontend ALB and traffic from the ALB to the frontend ASG.
  - **FrontendAsgSG**: Restricts inbound traffic to only the frontend ALB.
  - **BackendAlbSG**: Allows traffic from the frontend ASG to the backend ALB and from the backend ALB to the backend ASG.
  - **BackendAsgSG**: Restricts inbound traffic to only the backend ALB.

#### **Contribution to the Infrastructure**
- Provides a shared networking layer for the frontend and backend tiers.
- Ensures secure communication between components using security groups.
- Simplifies resource sharing by exporting VPC and subnet details.

---

### **2. DatabaseStack**
**File**: `database-stack.js`

#### **Purpose**
The `DatabaseStack` defines the DynamoDB table used to store application data. It is globally replicated for high availability and low latency.

#### **Key Components**
- **DynamoDB Global Table**:
  - Table Name: `AtelierDB`
  - Billing Mode: `PAY_PER_REQUEST` for cost efficiency.
  - Attributes: Includes primary keys (`PK`, `SK`) and additional attributes for global secondary indexes (GSIs).
  - Global Secondary Indexes:
    - `GSI_AllProducts`: Indexes all products by a product key.
    - `GSI_Category`: Indexes products by category.
    - `GSI_CategoryPrice`: Indexes products by category and price.
    - `GSI_UserOrders`: Indexes user orders by user ID.
    - `GSI_OrdersByDate`: Indexes orders by date.
  - Replicas: Replicated across `af-south-1` and `eu-west-1` for global availability.
  - TTL: Configured for automatic expiration of items.

#### **Contribution to the Infrastructure**
- Provides a highly available and scalable database for storing application data.
- Supports efficient querying through GSIs.
- Ensures low latency for global users with regional replicas.

---

### **3. BackendStack**
**File**: `backend-stack.js`

#### **Purpose**
The `BackendStack` defines the backend tier, including the backend ALB, ASG, and associated resources.

#### **Key Components**
- **ALB (Application Load Balancer)**:
  - Created using the `AlbConstruct`.
  - Handles incoming traffic to the backend ASG.
  - Configured with a health check path (`/`) and port (`80`).

- **ASG (Auto Scaling Group)**:
  - Created using the `AsgConstruct`.
  - Launches EC2 instances with a custom user data script to install and configure the backend application.
  - Scales based on CPU utilization.

- **User Data Script**:
  - Installs dependencies (`git`, `docker`, `docker-compose`).
  - Clones the application repository and starts the backend service using Docker.

#### **Contribution to the Infrastructure**
- Provides a scalable backend tier for processing business logic.
- Ensures high availability with an ALB and ASG.
- Automates backend application setup using a user data script.

---

### **4. Shared Resources**

#### **AlbConstruct**
**File**: `alb-construct.js`

**Purpose**: A reusable construct for creating Application Load Balancers (ALBs) and associated target groups.

**Key Features**:
- Creates an ALB with specified listener ports and security groups.
- Configures a target group with health checks.
- Outputs the ALB DNS name and target group ARN.

**Reason for Sharing**:
- Simplifies ALB creation for both frontend and backend tiers.
- Ensures consistent configuration across the infrastructure.

---

#### **AsgConstruct**
**File**: `asg-construct.js`

**Purpose**: A reusable construct for creating Auto Scaling Groups (ASGs) with launch templates.

**Key Features**:
- Configures a launch template with a machine image, instance type, and user data.
- Attaches the ASG to a target group.
- Scales based on CPU utilization.

**Reason for Sharing**:
- Simplifies ASG creation for both frontend and backend tiers.
- Ensures consistent scaling policies and configurations.

---

### **5. Entry Point**
**File**: `atelier.js`

#### **Purpose**
The entry point for the CDK application. It defines the stack deployment order and environment configuration.

#### **Key Components**
- **Environment Configuration**:
  - Uses `process.env.CDK_DEFAULT_ACCOUNT` and `process.env.CDK_DEFAULT_REGION` for deployment.
- **Stack Deployment**:
  - Deploys the `NetworkStack` first to provide shared networking resources.
  - Deploys the `DatabaseStack` for the DynamoDB table.
  - Deploys the `BackendStack` with a dependency on the `NetworkStack`.

#### **Contribution to the Infrastructure**
- Ensures proper stack deployment order.
- Provides a centralized entry point for managing the infrastructure.

---

## **Overall Architecture**

### **Frontend Tier**
- **Components**: CloudFront Distribution, ALB, ASG.
- **Purpose**: Handles user-facing requests and serves static content.

### **Backend Tier**
- **Components**: CloudFront Distribution, ALB, ASG.
- **Purpose**: Processes business logic and communicates with the database.

### **Database Tier**
- **Components**: DynamoDB Global Table.
- **Purpose**: Stores application data with global replication for high availability.

---

## **Shared Resources**
- **VPC**: Shared across all tiers to simplify networking.
- **Security Groups**: Shared between ALBs and ASGs to enforce consistent access rules.
- **Reusable Constructs**:
  - `AlbConstruct`: Simplifies ALB creation for frontend and backend tiers.
  - `AsgConstruct`: Simplifies ASG creation and scaling policies.

**Reason for Sharing**:
- Reduces duplication and ensures consistent configurations across the infrastructure.

---

## **Conclusion**
The Atelier infrastructure is designed for high availability, scalability, and efficient resource management. Shared resources and reusable constructs simplify the architecture while ensuring consistency across the frontend, backend, and database tiers.