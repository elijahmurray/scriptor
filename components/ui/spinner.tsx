const Spinner = () => {
    return (
        <div className="spinner"></div>
    );
};

export { Spinner };

const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  
    .spinner {
      display: inline-block;
      width: 24px;
      height: 24px;
      border: 2px solid rgba(255, 255, 255, 0.6);
      border-radius: 50%;
      border-top-color: #3490dc;
      animation: spin 1s linear infinite;
    }
  `;
document.head.append(style);