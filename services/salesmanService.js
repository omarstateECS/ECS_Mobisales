const { getPrismaClient } = require('../lib/prisma');
const { getLocalTimestamp } = require('../lib/dateUtils');
const visitService = require('./visitService');
const productService = require('./productService');
const customerService = require('./customerService');
const invoiceService = require('./invoiceService');
const actionService = require('./actionService');
const journeyService = require('./journeyService');


class SalesmanService {
    async getAllSalesmen() {
        const prisma = getPrismaClient();
        return await prisma.salesman.findMany({
            include: {
                authorities: {
                    include: {
                        authority: true
                    }
                },
                journies: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1  // Get only the latest journey
                },
                regions: {
                    include: {
                        region: true
                    }
                }
            }
        });
    }

    async getSalesmanById(id) {
        const prisma = getPrismaClient();
        
        if (!id) {
            throw new Error('Salesman ID is required');
        }
        
        return await prisma.salesman.findUnique({
            where: { salesId: Number(id) },
            include: {
                authorities: {
                    include: {
                        authority: true
                    }
                },
                regions: {
                    include: {
                        region: true
                    }
                }
            }
        });
    }

    async createSalesman(data) {
        const prisma = getPrismaClient();
        
        // Check if phone number already exists BEFORE attempting insert
        const existingSalesman = await prisma.salesman.findUnique({
            where: { phone: data.phone }
        });
        
        if (existingSalesman) {
            throw new Error('A salesman with this phone number already exists');
        }
        
        // Extract regionIds if provided
        const { password, regionIds, regionId, ...salesmanDataWithoutPassword } = data;
        const salesmanData = {
            ...salesmanDataWithoutPassword,
            deviceId: data.deviceId || '',
            password: 'temp', // Temporary password
            createdAt: data.createdAt || getLocalTimestamp()
        };
        
        // Create the salesman
        const newSalesman = await prisma.salesman.create({ 
            data: salesmanData,
            include: {
                authorities: {
                    include: {
                        authority: true
                    }
                }
            }
        });
        
        // Update password to match the actual assigned ID
        const updatedSalesman = await prisma.salesman.update({
            where: { salesId: newSalesman.salesId },
            data: { password: newSalesman.salesId.toString() },
            include: {
                authorities: {
                    include: {
                        authority: true
                    }
                },
                regions: {
                    include: {
                        region: true
                    }
                }
            }
        });
        
        // Assign regions if provided (support both regionIds array and single regionId for backward compatibility)
        const regionsToAssign = regionIds || (regionId ? [regionId] : []);
        if (regionsToAssign && regionsToAssign.length > 0) {
            await this.assignRegions(updatedSalesman.salesId, regionsToAssign);
        }
        
        // Fetch and return salesman with regions
        return await prisma.salesman.findUnique({
            where: { salesId: updatedSalesman.salesId },
            include: {
                authorities: {
                    include: {
                        authority: true
                    }
                },
                regions: {
                    include: {
                        region: true
                    }
                }
            }
        });
    }

    async updateSalesman(id, data) {
        const prisma = getPrismaClient();
        return await prisma.salesman.update({
            where: { salesId: Number(id) },
            data,
            include: {
                authorities: {
                    include: {
                        authority: true
                    }
                }
            }
        });
    }

    async deleteSalesman(id) {
        const prisma = getPrismaClient();
        return await prisma.salesman.delete({
            where: { salesId: Number(id) }
        });
    }

    // Replaces ALL existing region assignments with new ones
    async assignRegions(salesmanId, regionIds) {
        const prisma = getPrismaClient();
        const timestamp = getLocalTimestamp();
        
        // Delete ALL existing region assignments for this salesman
        await prisma.salesmanRegion.deleteMany({
            where: { salesmanId: Number(salesmanId) }
        });
        
        // Create new region assignments (replaces old ones)
        if (regionIds && regionIds.length > 0) {
            const regionAssignments = regionIds.map(regionId => ({
                salesmanId: Number(salesmanId),
                regionId: Number(regionId),
                createdAt: timestamp,
                updatedAt: timestamp
            }));
            
            await prisma.salesmanRegion.createMany({
                data: regionAssignments
            });
        }
        
        return await prisma.salesmanRegion.findMany({
            where: { salesmanId: Number(salesmanId) },
            include: {
                region: true
            }
        });
    }

    async assignAuthorities(salesmanId, authorityIds) {
        const prisma = getPrismaClient();
        
        // Get all available authorities
        const allAuthorities = await prisma.authority.findMany({
            select: { authorityId: true }
        });

        // For each authority, upsert the salesman_authority record
        for (const authority of allAuthorities) {
            const isAssigned = authorityIds.includes(authority.authorityId.toString()) || authorityIds.includes(authority.authorityId);
            
            const timestamp = getLocalTimestamp();
            await prisma.salesmanAuthority.upsert({
                where: {
                    salesmanId_authorityId: {
                        salesmanId: Number(salesmanId),
                        authorityId: authority.authorityId
                    }
                },
                update: {
                    value: isAssigned
                },
                create: {
                    salesmanId: Number(salesmanId),
                    authorityId: authority.authorityId,
                    value: isAssigned,
                    createdAt: timestamp
                }
            });
        }

        // Return the updated salesman with authorities
        return await prisma.salesman.findUnique({
            where: { salesId: Number(salesmanId) },
            include: {
                authorities: {
                    where: {
                        value: true  // Only return authorities where value is true
                    },
                    include: {
                        authority: true
                    }
                }
            }
        });
    }

    async getSalesmanAuthorities(salesmanId) {
        const prisma = getPrismaClient();
        
        const salesmanWithAuthorities = await prisma.salesman.findUnique({
            where: { salesId: Number(salesmanId) },
            include: {
                authorities: {
                    where: {
                        value: true  // Only get authorities where value is true
                    },
                    include: {
                        authority: true
                    }
                }
            }
        });

        if (!salesmanWithAuthorities) {
            throw new Error('Salesman not found');
        }

        // Return just the authorities with their details
        return salesmanWithAuthorities.authorities.map(sa => sa.authority);
    }

    async getAllSalesmanAuthorities(salesmanId) {
        const prisma = getPrismaClient();
        
        const salesmanWithAuthorities = await prisma.salesman.findUnique({
            where: { salesId: Number(salesmanId) },
            include: {
                authorities: {
                    include: {
                        authority: true
                    }
                }
            }
        });

        if (!salesmanWithAuthorities) {
            throw new Error('Salesman not found');
        }

        // Return authorities with their values for the modal
        return salesmanWithAuthorities.authorities.map(sa => ({
            ...sa.authority,
            assigned: sa.value  // Include the value as 'assigned' field
        }));
    }

    async updateAuthorities(salesmanId, authorityIds) {
        // This is the same as assignAuthorities - replace all authorities
        return await this.assignAuthorities(salesmanId, authorityIds);
    }

    async refreshAuthorities(salesmanId) {
        const prisma = getPrismaClient();
        
        // Get all authorities for the salesman
        const salesmanAuthorities = await prisma.salesmanAuthority.findMany({
            where: {
                salesmanId: Number(salesmanId),
            },
            include: {
                authority: true
            }
        });
        
        // Return authorities as an object with name: value pairs
        const authoritiesObject = {};
        salesmanAuthorities.forEach(sa => {
            authoritiesObject[sa.authority.name] = sa.value;
        });
        
        return authoritiesObject;
    }

    async getStats() {
        const prisma = getPrismaClient();
        const totalSales = await prisma.salesman.count();
        const activeSales = await prisma.salesman.count({
            where: {
                status: 'ACTIVE'
            }
        });
    
        return {
            totalSales,
            activeSales
        };
    }

    async getNextVisitIdForSalesman(salesmanId, tx) {
        try {
            const prismaClient = tx || getPrismaClient();
            
            // Find the highest visitId for this salesman
            const lastVisit = await prismaClient.visit.findFirst({
                where: {
                    salesId: parseInt(salesmanId)
                },
                orderBy: {
                    visitId: 'desc'
                },
                select: {
                    visitId: true
                }
            });
            
            // Return next visitId (start from 1 if no visits exist)
            return lastVisit ? lastVisit.visitId + 1 : 1;
        } catch (error) {
            console.error('Error getting next visitId:', error);
            return 1; // Default to 1 if error
        }
    }

    async checkIn(checkInData) {
        const prisma = getPrismaClient();
        const { salesmanId, deviceId, journeyId, salesman, visits, invoices, products, actions } = checkInData;
    
        const result = await prisma.$transaction(async (tx) => {
            const foundSalesman = await tx.salesman.findUnique({
                where: { salesId: Number(salesmanId) },
            });
    
            if (!foundSalesman) throw new Error('Salesman not found');
            if (foundSalesman.deviceId !== deviceId) throw new Error('Unauthorized device');
    
            const parseTimestamp = (timestamp) => {
                if (!timestamp) return null;
                // Dates are now strings, just return them as-is
                return timestamp;
            };

            // === JOURNEY ===
            let journey = null;
            if (journeyId && salesman) {
                const journeyUpdateData = {};
                
                if (salesman.startJourney) {
                    journeyUpdateData.startJourney = parseTimestamp(salesman.startJourney);
                }
                if (salesman.endJourney) {
                    journeyUpdateData.endJourney = parseTimestamp(salesman.endJourney);
                }

                if (Object.keys(journeyUpdateData).length > 0) {
                    journey = await tx.journies.update({
                        where: {
                            journeyId_salesId: {
                                journeyId: Number(journeyId),
                                salesId: Number(salesmanId)
                            }
                        },
                        data: journeyUpdateData
                    });

                    // Update salesman availability based on journey status
                    const salesmanUpdateData = {};
                    if (salesman.startJourney) {
                        // Journey started → set available to FALSE
                        salesmanUpdateData.available = false;
                    }
                    if (salesman.endJourney) {
                        // Journey ended → set available to TRUE
                        salesmanUpdateData.available = true;
                        
                        // Return unused stock when journey ends
                        const fillupService = require('./fillupService');
                        await fillupService.returnUnusedStock(
                            Number(salesmanId),
                            products,
                            tx
                        );
                    }

                    if (Object.keys(salesmanUpdateData).length > 0) {
                        await tx.salesman.update({
                            where: { salesId: Number(salesmanId) },
                            data: salesmanUpdateData
                        });
                    }
                }
            }
    
            // === VISITS ===
            // IMPORTANT: Visits must be created BEFORE invoices due to foreign key constraint
            const updatedVisits = [];

            if (Array.isArray(visits) && visits.length > 0) {
              for (const visit of visits) {
                try {   
                  const visitData = {};
                  
                  // Handle timestamps
                  if (visit.startTime) visitData.startTime = parseTimestamp(visit.startTime);
                  if (visit.endTime) visitData.endTime = parseTimestamp(visit.endTime);
                  if (visit.cancelTime) visitData.cancelTime = parseTimestamp(visit.cancelTime);
            
                  // Determine visit status
                  if (visit.cancelTime) {
                    visitData.status = 'CANCEL';
                  } else if (visit.endTime) {
                    visitData.status = 'END';
                  } else if (visit.startTime) {
                    visitData.status = 'START';
                  } else {
                    throw new Error(`Invalid visit update: missing timestamps for visit ${visit.visitId || visit.id}`);
                  }
            
                  // Use composite key for visit upsert (create or update)
                  const visitId = visit.visitId || visit.id;
                  const custId = visit.custId || visit.customerId;
                  
                  const timestamp = getLocalTimestamp();
                  await tx.visit.upsert({
                    where: {
                      visitId_salesId_journeyId: {
                        visitId: visitId,
                        salesId: salesmanId,
                        journeyId: journeyId
                      }
                    },
                    update: {
                      ...visitData,
                      updatedAt: timestamp
                    },
                    create: {
                      visitId: visitId,
                      custId: custId,
                      salesId: salesmanId,
                      journeyId: journeyId,
                      ...visitData,
                      createdAt: visitData.createdAt || timestamp,
                      updatedAt: timestamp
                    }
                  });
            
                  updatedVisits.push({ visitId: visitId, status: 'success' });
            
                } catch (error) {
                  throw new Error(`❌ Failed to upsert visit ${visit.visitId || visit.id}: ${error.message}`);
                }
              }
            }

            // === INVOICES ===
            const createdInvoices = [];
            if (invoices) {
                const invoiceArray = Array.isArray(invoices) ? invoices : [invoices];
    
                for (const invoice of invoiceArray) {
                    try {
                        if (invoice.reasonId !== 0) {
                            invoice.items.forEach(item => item.reasonId = null);
                        } else {
                            invoice.reasonId = null;
                            invoice.items.forEach(item => {
                                if (item.reasonId === 0) item.reasonId = null;
                            });
                        }
    
                        const invoiceData = {
                            ...invoice,
                            invId: invoice.invId || invoice.id,
                            salesId: invoice.salesId || salesmanId,
                            journeyId: journeyId,
                            visitId: invoice.visitId
                        };
    
                        const createdInvoice = await invoiceService.createInvoice(invoiceData, tx);
                        createdInvoices.push({ invId: invoiceData.invId, status: 'success' });
                    } catch (error) {
                        // Throw error to rollback transaction
                        throw new Error(`${error.message}`);
                    }
                }
            }

            // === PRODUCTS ===
            const updatedProducts = [];
            if (products && products.length > 0) {
                for (const product of products) {
                    try {
                        const updateData = {
                            stock: product.stock,
                            nonSellableQty: product.nonSellableQty
                        };
                        await prisma.product.update({
                            where: { prodId: Number(product.prodId) },
                            data: updateData,
                        });
                        updatedProducts.push({ productId: product.id, status: 'success' });
                    } catch (error) {
                        // Throw error to rollback transaction
                        throw new Error(`${error.message}`);
                    }
                }
            }

            // === ACTIONS ===
            console.log('═══════════════════════════════════════');
            console.log('🚀 ACTIONS SECTION STARTING');
            console.log('Actions received:', actions ? actions.length : 'NULL');
            console.log('Visits received:', visits ? visits.length : 'NULL');
            if (visits && visits.length > 0) {
              console.log('First visit:', visits[0]);
              console.log('Last visit:', visits[visits.length - 1]);
            }
            console.log('═══════════════════════════════════════');
            
            let actionCount = 0;
            if (Array.isArray(actions) && actions.length > 0) {
              try {
                // Prepare all actions for bulk insert
                const actionDataArray = actions.map(action => ({
                  id: action.id,
                  journeyId: journeyId,
                  visitId: action.visitId,
                  salesId: salesmanId,
                  actionId: action.actionId,
                  createdAt: parseTimestamp(action.createdAt)
                }));
                
                console.log('📋 Actions before modification:', actionDataArray.filter(a => a.actionId === 1 || a.actionId === 2));

                // Handle journey-level actions (start/end journey)
                console.log('🔍 Visits array:', visits ? visits.map(v => ({ visitId: v.visitId || v.id, createdAt: v.createdAt })) : 'null');
                
                // Find startJourney action (actionId = 1)
                const startJourneyAction = actionDataArray.find(a => a.actionId === 1);
                if (startJourneyAction && (startJourneyAction.visitId === 0 || !startJourneyAction.visitId)) {
                  console.log('🔍 Start journey action found with visitId:', startJourneyAction.visitId);
                  // Set to first visit in the visits array
                  if (visits && visits.length > 0) {
                    const firstVisitId = visits[0].visitId || visits[0].id;
                    console.log('✅ Setting start journey visitId to:', firstVisitId);
                    startJourneyAction.visitId = firstVisitId;
                  } else {
                    // No visits in request - query DB for existing visits
                    console.log('⚠️ No visits in request, querying DB for existing visits');
                    const existingVisitsForJourney = await tx.visit.findMany({
                      where: {
                        salesId: salesmanId,
                        journeyId: journeyId
                      },
                      orderBy: { createdAt: 'asc' },
                      take: 1,
                      select: { visitId: true }
                    });
                    
                    if (existingVisitsForJourney.length > 0) {
                      startJourneyAction.visitId = existingVisitsForJourney[0].visitId;
                      console.log('✅ Setting start journey visitId to first DB visit:', startJourneyAction.visitId);
                    } else {
                      console.warn('⚠️ No visits available for start journey action');
                    }
                  }
                }

                // Find endJourney action (actionId = 2)
                const endJourneyAction = actionDataArray.find(a => a.actionId === 2);
                if (endJourneyAction && (endJourneyAction.visitId === 0 || !endJourneyAction.visitId)) {
                  console.log('🔍 End journey action found with visitId:', endJourneyAction.visitId);
                  // Set to the last visit based on createdAt
                  if (visits && visits.length > 0) {
                    // Sort visits by createdAt to find the most recent one
                    const sortedVisits = [...visits].sort((a, b) => {
                      const dateA = a.createdAt || a.startTime || '';
                      const dateB = b.createdAt || b.startTime || '';
                      return dateB.localeCompare(dateA); // Descending order (most recent first) using string comparison
                    });
                    const lastVisitId = sortedVisits[0].visitId || sortedVisits[0].id;
                    console.log('✅ Setting end journey visitId to:', lastVisitId);
                    endJourneyAction.visitId = lastVisitId;
                  } else {
                    // No visits in request - query DB for existing visits
                    console.log('⚠️ No visits in request, querying DB for existing visits');
                    const existingVisitsForJourney = await tx.visit.findMany({
                      where: {
                        salesId: salesmanId,
                        journeyId: journeyId
                      },
                      orderBy: { createdAt: 'desc' },
                      take: 1,
                      select: { visitId: true }
                    });
                    
                    if (existingVisitsForJourney.length > 0) {
                      endJourneyAction.visitId = existingVisitsForJourney[0].visitId;
                      console.log('✅ Setting end journey visitId to last DB visit:', endJourneyAction.visitId);
                    } else {
                      console.warn('⚠️ No visits available for end journey action');
                    }
                  }
                }

                console.log('📋 Actions AFTER modification:', actionDataArray.filter(a => a.actionId === 1 || a.actionId === 2));
                console.log('═══════════════════════════════════════');

                // Validate all visitIds exist before inserting
                console.log('🔍 Action data before validation:', JSON.stringify(actionDataArray, null, 2));
                
                // Filter out actions that still have visitId 0 (couldn't be assigned to any visit)
                const actionsWithValidVisitIds = actionDataArray.filter(action => {
                  if (action.visitId === 0 || !action.visitId) {
                    console.warn(`⚠️ Skipping action ${action.id} (actionId: ${action.actionId}) - visitId is 0 or null, no visits available`);
                    return false;
                  }
                  return true;
                });
                
                const uniqueVisitIds = [...new Set(actionsWithValidVisitIds.map(a => a.visitId))];
                console.log('🔍 Unique visitIds to validate:', uniqueVisitIds);
                
                const existingVisits = await tx.visit.findMany({
                  where: {
                    salesId: salesmanId,
                    journeyId: journeyId,
                    visitId: { in: uniqueVisitIds }
                  },
                  select: { visitId: true, salesId: true, journeyId: true }
                });
                
                console.log('✅ Existing visits in DB:', JSON.stringify(existingVisits, null, 2));
                
                const existingVisitIds = new Set(existingVisits.map(v => v.visitId));
                
                // Filter to only valid actions
                const validActions = actionsWithValidVisitIds.filter(action => {
                  const isValid = existingVisitIds.has(action.visitId);
                  if (!isValid) {
                    console.warn(`⚠️ Skipping action ${action.id} (actionId: ${action.actionId}) - visitId ${action.visitId} does not exist in DB`);
                  }
                  return isValid;
                });
                
                console.log(`📊 Valid actions: ${validActions.length}/${actionDataArray.length}`);

                if (validActions.length === 0) {
                  console.warn('⚠️ No valid actions to insert');
                  actionCount = 0;
                } else {
                  // Use upsert for each action to handle duplicates properly
                  console.log(`🔄 Upserting ${validActions.length} actions...`);
                  let insertedCount = 0;
                  
                  for (const action of validActions) {
                    try {
                      await tx.actionDetails.upsert({
                        where: {
                          id_journeyId_visitId: {
                            id: action.id,
                            journeyId: action.journeyId,
                            visitId: action.visitId
                          }
                        },
                        update: {
                          salesId: action.salesId,
                          actionId: action.actionId,
                          createdAt: action.createdAt
                        },
                        create: action
                      });
                      insertedCount++;
                      console.log(`✅ Upserted action ${action.id} (actionId: ${action.actionId}, visitId: ${action.visitId})`);
                    } catch (error) {
                      console.error(`❌ Failed to upsert action ${action.id}:`, error.message);
                      // Continue with other actions instead of failing the entire transaction
                    }
                  }

                  actionCount = insertedCount;
                  console.log(`✅ Successfully upserted ${actionCount} actions`);
                }
              } catch (error) {
                throw new Error(`❌ Failed to create actions: ${error.message}`);
              }
            }
    
            return {
                message: '✅ Successfully checked in',
                journeyId: journey ? journey.journeyId : null,
                invoiceCount: invoices ? (Array.isArray(invoices) ? invoices.length : 1) : 0,
                visitCount: visits ? visits.length : 0,
                actionCount: actionCount,
                productCount: products ? products.length : 0,
            };
        });
    
        return result;
    }

    async createVisit(visitData) {
        const prisma = getPrismaClient();
        
        // Validate required customer fields
        if (!visitData.name) {
            throw new Error('❌ Customer name is required to create a visit');
        }
        
        try {
            const existingVisit = await prisma.visit.findUnique({
                where: {
                    visitId_salesId_journeyId: {
                        visitId: visitData.visitId,
                        salesId: visitData.salesId,
                        journeyId: visitData.journeyId
                    }
                },
                include: {
                    customer: true
                }
            });

            if (existingVisit) {
                return {
                    customerId: existingVisit.customer.customerId,
                };
            }

            // CHECK IF JOURNEY EXISTS, CREATE IF NOT
            const existingJourney = await prisma.journies.findUnique({
                where: {
                    journeyId_salesId: {
                        journeyId: visitData.journeyId,
                        salesId: visitData.salesId
                    }
                }
            });

            if (!existingJourney) {
                // Get the next global journey ID if the provided one doesn't exist
                const nextJourneyId = await journeyService.getNextJourneyId();
                
                // Create the journey with the global next ID
                const timestamp = getLocalTimestamp();
                await prisma.journies.create({
                    data: {
                        journeyId: nextJourneyId,
                        salesId: visitData.salesId,
                        startJourney: null,
                        endJourney: null,
                        createdAt: timestamp,
                        updatedAt: timestamp
                    }
                });
            }

            // CREATE THE NEW CUSTOMER FIRST
            const customer = await prisma.customer.create({
                data: {
                    name: visitData.name,
                    phone: visitData.phone,
                    address: visitData.address,
                    latitude: visitData.latitude,
                    longitude: visitData.longitude,
                    industryId: visitData.industryId ? parseInt(visitData.industryId) : null,
                    createdAt: getLocalTimestamp()
                }
            });
            
            // CREATE THE NEW VISIT
            const timestamp2 = getLocalTimestamp();
            const visit = await prisma.visit.create({
                data: {
                    visitId: visitData.visitId,
                    status: visitData.status || 'WAIT',
                    startTime: visitData.startTime || null,
                    endTime: visitData.endTime || null,
                    cancelTime: visitData.cancelTime || null,
                    createdAt: timestamp2,
                    updatedAt: timestamp2,
                    salesman: {
                        connect: { salesId: visitData.salesId }
                    },
                    journey: {
                        connect: { 
                            journeyId_salesId: {
                                journeyId: visitData.journeyId,
                                salesId: visitData.salesId
                            }
                        }
                    },
                    customer: {
                        connect: { customerId: customer.customerId }
                    }
                }
            });
            return {customerId: customer.customerId};
        } catch (error) {
            throw new Error(`Failed to create visit: ${error.message}`);
        }
    }

    async getInvoiceItems(invId) {
        const prisma = getPrismaClient();
        try {
            console.log('🔍 Fetching invoice items for invId:', invId, 'Type:', typeof invId);
            
            // First, fetch invoice items
            const items = await prisma.invoiceItem.findMany({
                where: {
                    invoiceHeaderId: String(invId)
                },
                include: {
                    reason: {
                        select: {
                            reasonId: true,
                            description: true
                        }
                    }
                },
                orderBy: {
                    invItem: 'asc'
                }
            });

            console.log(`✅ Found ${items.length} invoice items`);
            
            // Manually fetch product details for each item
            const itemsWithProducts = await Promise.all(
                items.map(async (item) => {
                    const product = await prisma.product.findUnique({
                        where: { prodId: item.productId },
                        select: {
                            name: true,
                            category: true
                        }
                    });

                    return {
                        ...item,
                        product: product,
                        // Map field names to match frontend expectations
                        prodId: item.productId,
                        uom: item.productUom,
                        qty: item.qty,
                        unitPrice: item.netAmt / item.qty, // Calculate unit price
                        total: item.totAmt,
                        discount: item.disAmt
                    };
                })
            );

            console.log(`✅ Returning ${itemsWithProducts.length} items with product details`);
            return itemsWithProducts;
        } catch (error) {
            console.error('Error fetching invoice items:', error);
            throw new Error(`Failed to fetch invoice items: ${error.message}`);
        }
    }

    async calculateNetQuantitiesAfterReturns(invoice) {
        const prisma = getPrismaClient();
        
        // Initialize returned quantities object
        const returnedQuantities = {};
        
        // Find all RETURN invoices that reference this SALE invoice
        const returnInvoices = await prisma.invoiceHeader.findMany({
            where: {
                invRef: invoice.invId,
                invType: 'RETURN'
            }
        });
        
        // If there are returns, calculate the returned quantities
        if (returnInvoices.length > 0) {
            // Fetch all return items for these return invoices
            const returnInvoiceIds = returnInvoices.map(inv => inv.invId);
            const returnItems = await prisma.invoiceItem.findMany({
                where: {
                    invoiceHeaderId: {
                        in: returnInvoiceIds
                    }
                }
            });
            
            // Calculate total returned quantities per product
            for (const returnItem of returnItems) {
                const key = `${returnItem.productId}_${returnItem.productUom}`;
                if (!returnedQuantities[key]) {
                    returnedQuantities[key] = 0;
                }
                returnedQuantities[key] += returnItem.qty;
            }
        }
        
        // Always add quantity fields to all items (even if no returns)
        if (invoice.items) {
            invoice.items = invoice.items.map(item => {
                const key = `${item.productId}_${item.productUom}`;
                const returnedQty = returnedQuantities[key] || 0;
                return {
                    ...item,
                    originalQty: item.qty,
                    returnedQty: returnedQty,
                    availableQty: item.qty - returnedQty
                };
            });
        }
        
        // No need to return, we modify in place
    }

    // Helper function to convert invoice amounts from strings to doubles
    convertInvoiceAmounts(invoice) {
        return {
            ...invoice,
            netAmt: parseFloat(invoice.netAmt) || 0,
            taxAmt: parseFloat(invoice.taxAmt) || 0,
            disAmt: parseFloat(invoice.disAmt) || 0,
            totalAmt: parseFloat(invoice.totalAmt) || 0,
            items: invoice.items?.map(item => ({
                ...item,
                qty: parseFloat(item.qty) || 0,
                disAmt: parseFloat(item.disAmt) || 0,
                netAmt: parseFloat(item.netAmt) || 0,
                taxAmt: parseFloat(item.taxAmt) || 0,
                totAmt: parseFloat(item.totAmt) || 0,
                originalQty: parseFloat(item.originalQty) || 0,
                returnedQty: parseFloat(item.returnedQty) || 0,
                availableQty: parseFloat(item.availableQty) || 0
            })) || []
        };
    }

    async searchInvoices(data) {
        const prisma = getPrismaClient();
        
        if (!data) {
            throw new Error('Search data is required');
        }
        
        const { invoiceId, date, customerId} = data;

        if (!customerId) {
            throw new Error('customerId is required to search invoices');
        }

        if (!invoiceId && !date) {
            throw new Error('No search criteria provided. Please provide either invoiceId or date');
        }

        if (invoiceId && !date) {
            try {
                const invoices = await prisma.invoiceHeader.findMany({
                    where: {
                        invId: invoiceId,
                        custId: customerId,
                        invType: 'SALE'
                    }
                });
                
                // Fetch items for each invoice and calculate net quantities
                for (const invoice of invoices) {
                    const items = await prisma.invoiceItem.findMany({
                        where: {
                            invoiceHeaderId: invoice.invId,
                        }
                    });
                    invoice.items = items;
                    
                    // Calculate net quantities after returns
                    await this.calculateNetQuantitiesAfterReturns(invoice);
                }
                
                // Convert amounts to doubles before returning
                return invoices.map(inv => this.convertInvoiceAmounts(inv));
            } catch (error) {
                console.error('Error searching invoices:', error);
                throw new Error(`Failed to search invoices: ${error.message}`);
            }
        }

        if (date && !invoiceId) {
            try {
                // Build where clause - salesId is always required
                const whereClause = {
                    createdAt: {
                        startsWith: date  // Matches any timestamp starting with the date
                    },
                    custId: customerId,
                    invType: 'SALE'
                };
                
                const invoices = await prisma.invoiceHeader.findMany({
                    where: whereClause
                });
                
                // Fetch items for each invoice separately and calculate net quantities
                for (const invoice of invoices) {
                    const items = await prisma.invoiceItem.findMany({
                        where: {
                            invoiceHeaderId: invoice.invId,
                        }
                    });
                    invoice.items = items;
                    
                    // Calculate net quantities after returns
                    await this.calculateNetQuantitiesAfterReturns(invoice);
                }
                
            // Convert amounts to doubles before returning
            return invoices.map(inv => this.convertInvoiceAmounts(inv));
        } catch (error) {
            console.error('Error searching invoices:', error);
            throw new Error(`Failed to search invoices: ${error.message}`);
        }
    }

    if (invoiceId && date) {
        try {
            // Build where clause - salesId is always required
            const whereClause = {
                invId: invoiceId,
                createdAt: {
                    startsWith: date  // Matches any timestamp starting with the date
                },
                custId: customerId,
                invType: 'SALE'
            };
            
            const invoice = await prisma.invoiceHeader.findFirst({
                where: whereClause
            });
            
            if (invoice) {
                // Fetch items separately since there's no relation in schema
                const items = await prisma.invoiceItem.findMany({
                    where: {
                        invoiceHeaderId: invoice.invId,
                    }
                });
                invoice.items = items;
                
                // Calculate net quantities after returns
                await this.calculateNetQuantitiesAfterReturns(invoice);
                
                // Convert amounts to doubles before returning
                return this.convertInvoiceAmounts(invoice);
            }
            
            return null;
        } catch (error) {
            console.error('Error searching invoices:', error);
            throw new Error(`Failed to search invoices: ${error.message}`);
        }
    }
}

async loadOrder(data) {
    const prisma = getPrismaClient();
    const { getLocalTimestamp } = require('../lib/dateUtils');
    
    try {
        const { salesId, journeyId, products } = data;
        
        if (!salesId || !journeyId) {
            throw new Error('salesId and journeyId are required');
        }
        
        if (!products || !Array.isArray(products) || products.length === 0) {
            throw new Error('products array is required and must not be empty');
        }
        
        // Get the next loadOrderId - one ID for the entire order
        const lastOrder = await prisma.loadOrders.findFirst({
            orderBy: { loadOrderId: 'desc' }
        });
        
        const nextLoadOrderId = (lastOrder?.loadOrderId || 0) + 1;
        const timestamp = getLocalTimestamp();
        
        // Validate all products first
        for (const product of products) {
            const { productId, quantity } = product;
            if (!productId || !quantity) {
                throw new Error('Each product must have productId and quantity');
            }
        }
        
        // Create load orders for each product with the SAME loadOrderId
        const orderData = products.map(product => ({
            loadOrderId: nextLoadOrderId,  // Same ID for all products in this order
            salesId: salesId,
            journeyId: journeyId,
            quantity: product.quantity,
            productId: product.productId,
            createdAt: timestamp,
            updatedAt: timestamp
        }));
        
        console.log('📦 Creating load order with data:', JSON.stringify(orderData, null, 2));
        
        // Insert all products at once
        await prisma.loadOrders.createMany({
            data: orderData
        });
        
        // Fetch and return the created orders with product details
        const createdOrders = await prisma.loadOrders.findMany({
            where: {
                loadOrderId: nextLoadOrderId,
                salesId: salesId,
                journeyId: journeyId
            },
            include: {
                product: {
                    include: {
                        units: true
                    }
                }
            }
        });
        
        console.log('📦 Created orders with products:', JSON.stringify(createdOrders, null, 2));
        
        return createdOrders;
    } catch (error) {
        console.error('Error loading order:', error);
        throw new Error(`Failed to load order: ${error.message}`);
    }
}

async getLoadOrders(data) {
    const prisma = getPrismaClient();
    
    try {
        const { salesId, journeyId } = data;
        
        const whereClause = {};
        
        // Add salesId filter only if provided
        if (salesId) {
            whereClause.salesId = salesId;
        }
        
        // Add journeyId filter only if provided
        if (journeyId) {
            whereClause.journeyId = journeyId;
        }
        
        const loadOrders = await prisma.loadOrders.findMany({
            where: whereClause,
            include: {
                product: {
                    include: {
                        units: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        
        console.log('📦 getLoadOrders result:', JSON.stringify(loadOrders, null, 2));
        
        return loadOrders;
    } catch (error) {
        console.error('Error getting load orders:', error);
        throw new Error(`Failed to get load orders: ${error.message}`);
    }
}

}

module.exports = new SalesmanService(); 