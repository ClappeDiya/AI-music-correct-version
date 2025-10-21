import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RuleSimulator } from "../rule-simulator";
import { useDynamicPricing } from "@/hooks/usedynamic-pricing";

// Mock the hooks
jest.mock("@/hooks/usedynamic-pricing");

describe("RuleSimulator", () => {
  const mockSimulatePrice = jest.fn();

  beforeEach(() => {
    (useDynamicPricing as jest.Mock).mockReturnValue({
      simulatePrice: mockSimulatePrice,
      isSimulating: false,
    });
  });

  it("renders the simulator form", () => {
    render(<RuleSimulator ruleId="test-rule" />);

    expect(screen.getByText("Price Simulator")).toBeInTheDocument();
    expect(screen.getByLabelText(/Base Price/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Quantity/)).toBeInTheDocument();
  });

  it("simulates price when form is submitted", async () => {
    const mockResult = {
      originalPrice: 100,
      adjustedPrice: 90,
      appliedRules: ["Test Rule"],
      currency: "USD",
    };

    mockSimulatePrice.mockResolvedValueOnce(mockResult);

    render(<RuleSimulator ruleId="test-rule" />);

    fireEvent.change(screen.getByLabelText(/Base Price/), {
      target: { value: "100" },
    });

    fireEvent.click(screen.getByText("Simulate Price"));

    await waitFor(() => {
      expect(screen.getByText("Simulation Results")).toBeInTheDocument();
      expect(screen.getByText("$90.00")).toBeInTheDocument();
    });
  });

  it("handles simulation errors gracefully", async () => {
    mockSimulatePrice.mockRejectedValueOnce(new Error("Simulation failed"));

    render(<RuleSimulator ruleId="test-rule" />);

    fireEvent.change(screen.getByLabelText(/Base Price/), {
      target: { value: "100" },
    });

    fireEvent.click(screen.getByText("Simulate Price"));

    await waitFor(() => {
      expect(screen.queryByText("Simulation Results")).not.toBeInTheDocument();
    });
  });
});
