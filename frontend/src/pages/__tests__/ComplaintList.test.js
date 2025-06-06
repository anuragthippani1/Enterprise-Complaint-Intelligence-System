import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../../contexts/AuthContext";
import { ComplaintList } from "../ComplaintList";
import { toast } from "react-toastify";
import { saveAs } from "file-saver";

// Mock the file-saver library
jest.mock("file-saver", () => ({
  saveAs: jest.fn(),
}));

// Mock the toast notifications
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

const mockComplaints = [
  {
    _id: "1",
    title: "Test Complaint 1",
    description: "Description 1",
    category: "Technical",
    status: "Open",
    submitted_by: "admin",
  },
  {
    _id: "2",
    title: "Test Complaint 2",
    description: "Description 2",
    category: "Billing",
    status: "Closed",
    submitted_by: "user1",
  },
];

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  );
};

describe("ComplaintList", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    global.fetch.mockReset();
  });

  it("shows export button for admin users", async () => {
    // Mock successful login and complaints fetch
    global.fetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ access_token: "mock-token" }),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ complaints: mockComplaints, total: 2 }),
        })
      );

    renderWithRouter(<ComplaintList />);

    // Wait for the export button to appear
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /export/i })
      ).toBeInTheDocument();
    });
  });

  it("handles successful export", async () => {
    // Mock successful login and complaints fetch
    global.fetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ access_token: "mock-token" }),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ complaints: mockComplaints, total: 2 }),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          blob: () => Promise.resolve(new Blob(["mock csv data"])),
        })
      );

    renderWithRouter(<ComplaintList />);

    // Click export button
    const exportButton = await screen.findByRole("button", { name: /export/i });
    fireEvent.click(exportButton);

    // Wait for export to complete
    await waitFor(() => {
      expect(saveAs).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith(
        "Export completed successfully"
      );
    });
  });

  it("handles export error", async () => {
    // Mock successful login and complaints fetch
    global.fetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ access_token: "mock-token" }),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ complaints: mockComplaints, total: 2 }),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
        })
      );

    renderWithRouter(<ComplaintList />);

    // Click export button
    const exportButton = await screen.findByRole("button", { name: /export/i });
    fireEvent.click(exportButton);

    // Wait for error toast
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to export complaints");
    });
  });

  it("includes filters in export request", async () => {
    // Mock successful login and complaints fetch
    global.fetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ access_token: "mock-token" }),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ complaints: mockComplaints, total: 2 }),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          blob: () => Promise.resolve(new Blob(["mock csv data"])),
        })
      );

    renderWithRouter(<ComplaintList />);

    // Set filters
    const categorySelect = await screen.findByLabelText(/category/i);
    fireEvent.change(categorySelect, { target: { value: "Technical" } });

    const statusSelect = await screen.findByLabelText(/status/i);
    fireEvent.change(statusSelect, { target: { value: "Open" } });

    // Click export button
    const exportButton = await screen.findByRole("button", { name: /export/i });
    fireEvent.click(exportButton);

    // Wait for export to complete and verify filters were included
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("category=Technical"),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("status=Open"),
        expect.any(Object)
      );
    });
  });
});
