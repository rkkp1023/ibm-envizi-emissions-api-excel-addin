// Copyright IBM Corp. 2025

/**
 * Calls the recommender API to search for activity types
 */
export async function recommend(
  search: string,
  country: string,
  stateProvince?: string,
  date?: string,
  page?: number,
  size?: number
): Promise<any[][]> {
  try {
    // Use the new direct endpoint URL
    const recommenderUrl = "https://dp.wbs-shared-services-dal.np.wce.ibm.com/v3/carbon/recommender/type/search";

    // Build request body with new structure
    const requestBody: any = {
      location: {
        country: country,
      },
      activity: {
        search: search,
      },
      pagination: {
        page: page || 1,
        size: size || 1,
      },
    };

    // Add optional parameters
    if (stateProvince) {
      requestBody.location.stateProvince = stateProvince;
    }

    if (date) {
      requestBody.time = { date: date };
    }

    // Make the API call with hardcoded headers
    // Token should be appended manually for local testing
    const response = await fetch(recommenderUrl, {
      method: "POST",
      headers: {
        "Authorization": "Bearer ",
        "Content-Type": "application/json",
        "accept": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Extract and format the response
    if (!data.types || !Array.isArray(data.types)) {
      throw new CustomFunctions.Error(
        CustomFunctions.ErrorCode.notAvailable,
        "Invalid API response format"
      );
    }

    // Return only the first result with activityType, activityDescription, and confidence
    if (data.types.length > 0) {
      const firstResult = data.types[0];
      return [[
        firstResult.activityType || "",
        firstResult.confidence || "",
        firstResult.activityDescription || ""
      ]];
    }

    // Return empty result if no types found
    return [["", "", 0]];
  } catch (e: any) {
    if (e instanceof CustomFunctions.Error) throw e;

    const message = e?.message || "Unknown error";
    console.error("Recommend API request failed: ", message);

    throw new CustomFunctions.Error(
      CustomFunctions.ErrorCode.notAvailable,
      message
    );
  }
}

// Made with Bob
