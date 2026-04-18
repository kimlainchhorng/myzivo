/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
  token: string
}

export const SignupEmail = ({
  siteName,
  recipient,
  token,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your {siteName} verification code: {token}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={brand}>ZIVO ID</Heading>
        <Heading style={h1}>Confirm your email</Heading>
        <Text style={text}>
          Welcome to {siteName}! Enter this 6-digit code on the verification
          screen to activate your account ({recipient}):
        </Text>
        <Text style={codeBox}>{token}</Text>
        <Text style={subtle}>This code expires in 1 hour.</Text>
        <Text style={footer}>
          If you didn't create a ZIVO account, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '480px' }
const brand = {
  fontSize: '14px',
  fontWeight: 'bold' as const,
  color: '#10b981',
  letterSpacing: '2px',
  margin: '0 0 24px',
}
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#0a0a0a',
  margin: '0 0 16px',
}
const text = {
  fontSize: '15px',
  color: '#52525b',
  lineHeight: '1.6',
  margin: '0 0 24px',
}
const codeBox = {
  fontFamily: '"SF Mono", Menlo, Monaco, Courier, monospace',
  fontSize: '36px',
  fontWeight: 'bold' as const,
  color: '#0a0a0a',
  letterSpacing: '12px',
  textAlign: 'center' as const,
  background: '#ecfdf5',
  border: '1px solid #10b981',
  borderRadius: '12px',
  padding: '20px',
  margin: '0 0 16px',
}
const subtle = { fontSize: '13px', color: '#71717a', textAlign: 'center' as const, margin: '0 0 32px' }
const footer = { fontSize: '12px', color: '#a1a1aa', margin: '24px 0 0', borderTop: '1px solid #e4e4e7', paddingTop: '16px' }
