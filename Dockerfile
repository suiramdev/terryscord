FROM node:16

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install -g prisma@latest pnpm@latest
RUN pnpm install

# Copy the rest of the application code to the working directory
COPY . .

# Run Prisma migrations
RUN prisma db push

# Generate Prisma client
RUN prisma generate

# Build the application
RUN pnpm run build

# Expose the port the app runs on
EXPOSE 3000

# Define environment variable
ENV NODE_ENV production

# Command to run the application
CMD ["pnpm", "run", "start"]
