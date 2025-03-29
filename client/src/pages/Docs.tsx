import React from 'react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Docs() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-400 text-transparent bg-clip-text">
          Roblox Token Integration Guide
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Learn how to integrate tokens from this platform into your Roblox game
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>
            How the token system connects with your Roblox game
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This platform allows users to earn tokens by completing tasks (playing minigames and watching ads).
            These tokens can be redeemed in your Roblox game for in-game rewards like Robux or special items.
          </p>
          <p>
            The integration works by verifying tokens through an API endpoint that your Roblox game will call
            using the HttpService.
          </p>
        </CardContent>
      </Card>

      <Accordion type="single" collapsible className="mb-8">
        <AccordionItem value="step1">
          <AccordionTrigger className="text-lg font-semibold">
            Step 1: Enable HttpService in Roblox
          </AccordionTrigger>
          <AccordionContent>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Open your Roblox game in Roblox Studio</li>
              <li>Go to "Game Settings" (or press Alt+S)</li>
              <li>Click on the "Security" tab</li>
              <li>Enable "Allow HTTP Requests"</li>
              <li>Save your game</li>
            </ol>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step2">
          <AccordionTrigger className="text-lg font-semibold">
            Step 2: Create a Token Redemption Script
          </AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">Add this script to a ServerScriptService in your Roblox game:</p>
            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto text-sm mb-4">
{`-- Token Verification Script
local HttpService = game:GetService("HttpService")
local API_URL = "${window.location.origin}/api/verify-token"

local function verifyToken(player, token)
    -- Make sure the token is valid format
    if not token or type(token) ~= "string" or #token < 10 then
        return false, "Invalid token format"
    end
    
    local success, result
    
    -- Try to verify the token with our API
    success, result = pcall(function()
        local requestData = HttpService:JSONEncode({
            username = player.Name,
            token = token
        })
        
        local response = HttpService:PostAsync(
            API_URL,
            requestData,
            Enum.HttpContentType.ApplicationJson
        )
        
        return HttpService:JSONDecode(response)
    end)
    
    -- Check if the request was successful
    if not success then
        return false, "Error connecting to verification server"
    end
    
    -- Check if the token is valid
    if result.success then
        return true, "Token verified successfully!"
    else
        return false, result.message or "Invalid token"
    end
end

-- Create a remote function for token redemption
local RedeemTokenFunction = Instance.new("RemoteFunction")
RedeemTokenFunction.Name = "RedeemToken"
RedeemTokenFunction.Parent = game:GetService("ReplicatedStorage")

-- Handle token redemption requests
RedeemTokenFunction.OnServerInvoke = function(player, token)
    local success, message = verifyToken(player, token)
    
    if success then
        -- Give the player their reward here
        -- For example:
        -- player.leaderstats.Coins.Value = player.leaderstats.Coins.Value + 100
        
        -- You could also mark the token as used to prevent multiple redemptions
        
        return {success = true, message = "You've received your reward!"}
    else
        return {success = false, message = message}
    end
end`}
            </pre>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step3">
          <AccordionTrigger className="text-lg font-semibold">
            Step 3: Create a GUI for Token Redemption
          </AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              Create a GUI that allows players to enter their token. Here's a simple example script for a local GUI:
            </p>
            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto text-sm mb-4">
{`-- Token Redemption GUI
-- Place this in a LocalScript inside a ScreenGui

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RedeemToken = ReplicatedStorage:WaitForChild("RedeemToken")
local player = game.Players.LocalPlayer

-- Reference to GUI elements
local tokenInput = script.Parent:WaitForChild("TokenInput")
local redeemButton = script.Parent:WaitForChild("RedeemButton")
local statusLabel = script.Parent:WaitForChild("StatusLabel")

-- Handle redeem button click
redeemButton.MouseButton1Click:Connect(function()
    local token = tokenInput.Text
    
    if token == "" then
        statusLabel.Text = "Please enter a token"
        return
    end
    
    -- Show loading state
    statusLabel.Text = "Verifying token..."
    
    -- Call the server to verify the token
    local result = RedeemToken:InvokeServer(token)
    
    -- Update status based on result
    if result.success then
        statusLabel.Text = result.message
        statusLabel.TextColor3 = Color3.fromRGB(0, 255, 0) -- Green text for success
        
        -- Clear the input
        tokenInput.Text = ""
    else
        statusLabel.Text = result.message
        statusLabel.TextColor3 = Color3.fromRGB(255, 0, 0) -- Red text for error
    end
end)`}
            </pre>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="testing">
          <AccordionTrigger className="text-lg font-semibold">
            Testing Your Integration
          </AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">To test your integration:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Get a token from this website by completing the required tasks</li>
              <li>Open your Roblox game</li>
              <li>Use the token redemption GUI you created</li>
              <li>Enter the token and click "Redeem"</li>
              <li>Verify that the token is validated and rewards are given</li>
            </ol>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Card>
        <CardHeader>
          <CardTitle>API Reference</CardTitle>
          <CardDescription>
            Technical details for developers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Token Verification Endpoint</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                POST {window.location.origin}/api/verify-token
              </p>
              <h4 className="mt-2 font-medium">Request Body:</h4>
              <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md text-sm">
{`{
  "username": "RobloxUsername",
  "token": "BLOX-XXXX-XXXX-XXXX"
}`}
              </pre>
              <h4 className="mt-2 font-medium">Response (Success):</h4>
              <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md text-sm">
{`{
  "success": true,
  "message": "Token verified successfully",
  "username": "RobloxUsername"
}`}
              </pre>
              <h4 className="mt-2 font-medium">Response (Error):</h4>
              <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md text-sm">
{`{
  "success": false,
  "message": "Invalid token" // or other error message
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}