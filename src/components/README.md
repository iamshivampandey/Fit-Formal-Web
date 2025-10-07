# LoginForm Component

A responsive, reusable login form component that matches the design from the provided image. This component is built with mobile-first design principles and works seamlessly on both mobile and desktop devices.

## Features

- ✅ **Responsive Design**: Mobile-first approach with breakpoints for tablet and desktop
- ✅ **Form Validation**: Built-in email and password validation
- ✅ **Accessibility**: Proper focus management and ARIA support
- ✅ **Dark Mode Support**: Automatic dark mode detection
- ✅ **Customizable**: Configurable app name and event handlers
- ✅ **Modern UI**: Clean, iOS-inspired design with smooth animations
- ✅ **TypeScript Ready**: Written in JSX with proper prop handling

## Usage

### Basic Usage

```jsx
import LoginForm from './components/LoginForm';

function App() {
  const handleLogin = (formData) => {
    console.log('Login data:', formData);
    // Your login logic here
  };

  return (
    <LoginForm
      appName="Your App Name"
      onLogin={handleLogin}
    />
  );
}
```

### Complete Usage with All Handlers

```jsx
import LoginForm from './components/LoginForm';

function App() {
  const handleLogin = (formData) => {
    // Handle login
    console.log('Login:', formData);
  };

  const handleGoogleLogin = () => {
    // Handle Google OAuth
    console.log('Google login');
  };

  const handleForgotPassword = () => {
    // Handle forgot password
    console.log('Forgot password');
  };

  const handleSignUp = () => {
    // Handle sign up
    console.log('Sign up');
  };

  const handleTermsClick = () => {
    // Handle terms & conditions
    console.log('Terms clicked');
  };

  const handlePrivacyClick = () => {
    // Handle privacy policy
    console.log('Privacy clicked');
  };

  const handleFaqClick = () => {
    // Handle FAQ
    console.log('FAQ clicked');
  };

  return (
    <LoginForm
      appName="Fit Formal"
      onLogin={handleLogin}
      onGoogleLogin={handleGoogleLogin}
      onForgotPassword={handleForgotPassword}
      onSignUp={handleSignUp}
      onTermsClick={handleTermsClick}
      onPrivacyClick={handlePrivacyClick}
      onFaqClick={handleFaqClick}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `appName` | `string` | `"Fit Formal"` | The name of your application |
| `onLogin` | `function` | - | Callback when login form is submitted |
| `onGoogleLogin` | `function` | - | Callback when Google login is clicked |
| `onForgotPassword` | `function` | - | Callback when forgot password is clicked |
| `onSignUp` | `function` | - | Callback when sign up is clicked |
| `onTermsClick` | `function` | - | Callback when terms & conditions is clicked |
| `onPrivacyClick` | `function` | - | Callback when privacy policy is clicked |
| `onFaqClick` | `function` | - | Callback when FAQ is clicked |

## Form Data Structure

The `onLogin` callback receives a form data object with the following structure:

```javascript
{
  email: "user@example.com",
  password: "userpassword"
}
```

## Validation

The component includes built-in validation for:

- **Email**: Required and must be a valid email format
- **Password**: Required and must be at least 6 characters

Validation errors are displayed below each input field and cleared when the user starts typing.

## Styling

The component uses CSS modules and includes:

- **Mobile-first responsive design**
- **Dark mode support** (automatic detection)
- **Smooth animations and transitions**
- **Focus states for accessibility**
- **iOS-inspired design language**

### Customization

You can customize the appearance by modifying the CSS variables in `LoginForm.css`:

```css
:root {
  --primary-color: #007AFF;
  --error-color: #FF3B30;
  --text-color: #000000;
  --secondary-text: #8E8E93;
  --background-color: #ffffff;
  --input-background: #F2F2F7;
  --border-color: #E5E5EA;
}
```

## Responsive Breakpoints

- **Mobile**: Default styles (up to 767px)
- **Tablet**: 768px and above
- **Desktop**: 1024px and above

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Examples

See `HandleLoginFormPage.jsx` for a complete implementation example with all handlers and status messages.

## File Structure

```
src/
├── components/
│   ├── LoginForm.jsx          # Main component
│   ├── LoginForm.css          # Styles
│   ├── HandleLoginFormPage.jsx # Usage example
│   └── README.md             # This documentation
```

## Integration with Authentication

This component is designed to work with any authentication system. You can integrate it with:

- Firebase Auth
- Auth0
- Custom JWT authentication
- OAuth providers (Google, Facebook, etc.)

Simply implement the appropriate logic in your callback functions.
